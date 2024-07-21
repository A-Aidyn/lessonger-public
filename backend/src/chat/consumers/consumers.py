# chat/consumers.py
import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

import requests
import urllib3
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.conf import settings
from django.shortcuts import get_object_or_404

from ..tasks import trigger_notifications_in_chat
from chat.consumers.helper import message_to_json, messages_to_json
from chat.models import Message, Chat, Membership, Channel
from chat.views import get_messages, get_current_chat
from rest_framework.authtoken.models import Token
from files.models import FilesModel
from user_profile.models import Profile

from chat.api.serializers import ProfileSerializer, MessageSerializer


logger = logging.getLogger(__name__)
User = get_user_model()


class ChatConsumer(WebsocketConsumer):

    # Server websocket sends to consumer websocket two commands:
    # 0) authorize: sends to the consumer (client) if the authorization was successful or not
    # 1) messages: sends to the consumer (client) list of fetched messages
    # 2) new_message: sends to the consumer (client) an incoming new message

    def authorize(self, data):
        token = data['token']
        content = {
            'command': 'authorize',
            'content': True
        }
        try:
            self.scope['user'] = Token.objects.get(key=token).user
            self.send_message(content)
        except Token.DoesNotExist:
            content = {
                'command': 'authorize',
                'content': False
            }
            self.scope['user'] = None
            self.send_message(content)

    # get the messages that we need to load
    def fetch_messages(self, data):
        block_size = 15
        try:
            chat = Chat.objects.get(participants__username=self.scope['user'].username, id=data['chat_id'])
        except Chat.DoesNotExist:
            self.send_error("Cannot find the chat with the given id!")
            return
        if data.get('message_id', 0) == 0:
            messages = chat.messages.order_by('timestamp').all()[0:block_size]
        else:
            message_id = data['message_id']
            t = data.get('type', 'between')
            if t == 'older':
                messages = chat.messages.filter(id__lt=message_id).order_by('-timestamp').all()[0:block_size][::-1]
            elif t == 'newer':
                messages = chat.messages.filter(id__gt=message_id).order_by('timestamp').all()[0:block_size]
            else:
                messages = chat.messages.filter(id__lte=message_id).order_by('-timestamp').all()[0:block_size][::-1]
                messages.extend(chat.messages.filter(id__gt=message_id).order_by('timestamp').all()[0:block_size])

        content = {
            'command': 'fetch_messages',
            'type': data.get('type', 'between'),
            'chat_id': data['chat_id'],
            'message_id': data['message_id'],
            'block_size': block_size,
            'content': messages_to_json(messages)
        }

        self.send_message(content)

    def new_message(self, data):
        logger.debug(f'incoming new message {data}')
        logger.debug(f"user: {self.scope['user']}")
        try:
            user = User.objects.get(username=data['username'])
        except User.DoesNotExist:
            self.send_error("Cannot find any user with the given username")
            return

        try:
            chat = Chat.objects.get(id=data['chat_id'])
        except Chat.DoesNotExist:
            self.send_error("Cannot find any chat with the given id")
            return

        # if data.get('content_type', 't') == 'f':
        #     logger.debug(data.get('file_url'), None)
        # logger.debug(data)
        message_data = data.get('data', {})
        reply_to = message_data.get('reply_to', 0)
        if reply_to is None:
            reply_to = 0
        logger.debug(f"[REPLY_TO]: {reply_to}")
        message = Message.objects.create(
            contact=user,
            chat=chat,
            content=message_data.get('content', None),
            file_url=message_data.get('file_url', None),
            content_type=message_data.get('content_type', 't'),
            reply_to=reply_to
        )

        chat.messages.add(message)
        chat.save()

        logger.debug('sending notifications!!!')
        trigger_notifications_in_chat.delay(chat.id, message.id)

        try:
            membership = Membership.objects.get(user=user, chat=chat)
        except Membership.DoesNotExist:
            membership = Membership.objects.create(user=user, chat=chat)

        membership.last_read_message = max(membership.last_read_message, message.id)
        membership.save()

        message = {
            'command': 'new_message',
            'chat_id': data['chat_id'],
            # 'channel': data['channel_id'],
            'content': message_to_json(message)
        }
        self.send_chat_message(message)

    def update_last_read_messages(self, data):
        # logger.debug("Updating last read message!")
        # logger.debug(data)
        try:
            user = User.objects.get(username=data['username'])
        except User.DoesNotExist:
            self.send_error("Cannot find any user with the given username")
            return

        try:
            chat = Chat.objects.get(id=data['chat_id'])
        except Chat.DoesNotExist:
            self.send_error("Cannot find any chat with the given id")
            return

        try:
            membership = Membership.objects.get(user=user, chat=chat)
        except Membership.DoesNotExist:
            membership = Membership.objects.create(user=user, chat=chat)

        membership.last_read_message = max(membership.last_read_message, data['last_read_message'])
        membership.save()

        self.send_chat_message(data)

    def user_typing(self, data):
        self.send_chat_message(data)

    def update_pinned_message(self, data):
        logger.debug(f"Updating pinned message! data: {data}")
        try:
            chat = Chat.objects.get(id=data['chat_id'])
        except Chat.DoesNotExist:
            self.send_error("Cannot find any chat with the given id")
            return
        chat.pinned_message = data['message_id']
        try:
            message = Message.objects.get(id=data['message_id'])
            data['message'] = message_to_json(message, False)
        except Message.DoesNotExist:
            data['message'] = {}
        chat.save()
        self.send_chat_message(data)

    # Server websocket receives from consumer websocket two commands:
    # 0) authorize: consumer (client) sends its token
    # 1) fetch_messages: consumer (client) wants the list of fetched messages
    # 2) new_message: consumer (client) sends a new message
    # 3) update_last_read_messages: consumer (client) sends the list of updated last_read_messages of the chats

    commands = {
        'authorize': authorize,
        'fetch_messages': fetch_messages,
        'new_message': new_message,
        'update_last_read_messages': update_last_read_messages,
        'user_typing': user_typing,
        'update_pinned_message': update_pinned_message,
    }

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']

        # Constructs a Channels group name directly from the user-specified room name, without any quoting or
        # escaping. Group names may only contain letters, digits, hyphens, and periods. Therefore this example code
        # will fail on room names that have other characters.
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code=1000):
        # Send offline identifier
        if self.scope['user'] and self.scope['user'].is_authenticated:
            now = datetime.now(timezone.utc)
            try:
                profile = Profile.objects.get(owner__username=self.scope['user'].username)
                profile.last_active_time = now - timedelta(minutes=5)
                profile.save()
                content = {
                    'command': 'update_last_active_time',
                    'username': self.scope['user'].username,
                    'timestamp': str(profile.last_active_time) + 'Z',
                }
                self.send_chat_message(content)
            except Profile.DoesNotExist:
                pass
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        self.scope['user'] = None

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if (text_data_json['command'] != "authorize") and (not self.scope['user'] or not self.scope['user'].is_authenticated):
            self.disconnect()
            return
        if self.scope['user'] and self.scope['user'].is_authenticated:
            now = datetime.now(timezone.utc)
            try:
                profile = Profile.objects.get(owner__username=self.scope['user'].username)
                passed_time = now - profile.last_active_time
                if passed_time.total_seconds() // 60 >= 3:
                    profile.last_active_time = now
                    profile.save()
                    content = {
                        'command': 'update_last_active_time',
                        'username': self.scope['user'].username,
                        'timestamp': str(profile.last_active_time) + 'Z',
                    }
                    self.send_chat_message(content)
            except Profile.DoesNotExist:
                pass

        self.commands[text_data_json['command']](self, text_data_json)

    # Send message to room group
    def send_chat_message(self, content):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',  # function name?
                'message': content
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        chat_id = event['message'].get('chat_id', None)
        user = self.scope['user']
        if not user or not user.is_authenticated:
            return
        # if chat_id is not specified then this is just update_last_active_time command and thus we may send it to everyone (TODO: maybe fix this some time later)
        if chat_id is None:
            message = event['message']
            self.send(text_data=json.dumps(message))
            return
        message = event['message']
        if message['command'] == 'new_message':
            chat = Chat.objects.get(id=message['chat_id'])
            if not chat.channel:
                channel = Channel.objects.get(participants__username=self.scope['user'].username, is_course=False)
            else:
                channel = chat.channel
            # logger.debug(f'LOLOLOLOL channel: {channel} id: {channel.id}')
            message['channel_id'] = channel.id

        # Send message to WebSocket only if the user consists in the chat
        if Chat.objects.filter(id=chat_id, participants=user).exists():
            self.send(text_data=json.dumps(message))

    # Send message to the current consumer (not to the whole group)
    def send_message(self, message):
        self.send(text_data=json.dumps(message))

    # Send error to the current consumer (not to the whole group)
    def send_error(self, message):
        content = {
            'command': 'error',
            'content': message
        }
        self.send_message(content)


"""
# Asynchronous code
class ChatConsumer(AsyncWebsocketConsumer):
    async def get_object_or_error(self, model, name='model', **kwargs):
        try:
            @database_sync_to_async
            def get():
                return model.objects.get(**kwargs)
            return await get()
        except model.DoesNotExist:
            await self.send_error(f"Cannot find the {name} with the given parameters: {kwargs}!")
            return None

    @database_sync_to_async
    def get_field(self, my_object, field):
        return getattr(my_object, field)

    @database_sync_to_async
    def set_field(self, my_object, field, value):
        setattr(my_object, field, value)

    @database_sync_to_async
    def save(self, current):
        current.save()

    # [COMMAND] authorize: sends to the consumer (client) if the authorization was successful or not
    async def authorize(self, data):
        token = data['token']
        content = {
            'command': 'authorize',
            'content': True
        }
        try:
            tmp = await self.get_object_or_error(Token, 'token', key=token)
            self.scope['user'] = await self.get_field(tmp, 'user')
            await self.send_message(content)
        except Token.DoesNotExist:
            content = {
                'command': 'authorize',
                'content': False
            }
            self.scope['user'] = None
            await self.send_message(content)

    # get the messages that we need to load
    # [COMMAND] messages: sends to the consumer (client) list of fetched messages
    async def fetch_messages(self, data):
        block_size = 15
        chat = await self.get_object_or_error(model=Chat, name='chat', participants__username=self.scope['user'].username, id=data['chat_id'])
        if not chat:
            return
        message_id = data.get('message_id', 0)
        if message_id == 0:
            data['type'] = 'newer'
        t = data.get('type', 'between')
        if t == 'older':
            @database_sync_to_async
            def f():
                return chat.messages.filter(id__lt=message_id).order_by('-timestamp').all()[0:block_size][::-1]
            messages = await f()
        elif t == 'newer':
            @database_sync_to_async
            def f():
                return chat.messages.filter(id__gt=message_id).order_by('timestamp').all()[0:block_size][::1]
            messages = await f()
        else:
            @database_sync_to_async
            def f1():
                return chat.messages.filter(id__lte=message_id).order_by('-timestamp').all()[0:block_size][::-1]
            messages = await f1()

            @database_sync_to_async
            def f2():
                messages.extend(chat.messages.filter(id__gt=message_id).order_by('timestamp').all()[0:block_size])
            await f2()

        content = {
            'command': 'fetch_messages',
            'type': data.get('type', 'between'),
            'chat_id': data['chat_id'],
            'message_id': data['message_id'],
            'block_size': block_size,
            'content': await messages_to_json(messages)
        }

        await self.send_message(content)

    @database_sync_to_async
    def update_last_read_message(self, user, chat, msg_id):
        try:
            membership = Membership.objects.get(user=user, chat=chat)
        except Membership.DoesNotExist:
            membership = Membership.objects.create(user=user, chat=chat)
        membership.last_read_message = max(membership.last_read_message, msg_id)
        membership.save()

    # [COMMAND] new_message: sends to the consumer (client) an incoming new message
    async def new_message(self, data):
        logger.debug(f'incoming new message {data}')
        logger.debug(f"user: {self.scope['user']}")
        user = await self.get_object_or_error(model=User, name='user', username=data['username'])
        chat = await self.get_object_or_error(model=Chat, name='chat', id=data['chat_id'])
        if (not user) or (not chat):
            return

        message_data = data.get('data', {})
        reply_to = message_data.get('reply_to', 0)
        if reply_to is None:
            reply_to = 0
        logger.debug(f"[REPLY_TO]: {reply_to}")

        @database_sync_to_async
        def create_message():
            new_message = Message.objects.create(
                contact=user,
                chat=chat,
                content=message_data.get('content', None),
                file_url=message_data.get('file_url', None),
                content_type=message_data.get('content_type', 't'),
                reply_to=reply_to
            )
            chat.messages.add(new_message)
            chat.save()
            return new_message

        message = await create_message()

        await self.update_last_read_message(user, chat, await self.get_field(message, 'id'))

        message = {
            'command': 'new_message',
            'chat_id': data['chat_id'],
            # 'channel': data['channel_id'],
            'content': await message_to_json(message)
        }
        # logger.debug(f'Sending message to front!: {message}')
        await self.send_chat_message(message)

        name = await self.get_field(chat, "name")
        # WARNING
        text = f'From {message["content"]["contact"]["username"]} in {name}: {message["content"]["content"]}'
        if await self.get_field(chat, 'is_private'):
            text = f'From {message["content"]["contact"]["username"]}: {message["content"]["content"]}'
        # WARNING

        # start = datetime.now()
        # @database_sync_to_async
        # def participants_list():
        #     return chat.participants.all()[::1]
        # participants = await participants_list()
        # for participant in participants:
        #     if await self.get_field(participant, 'username') != message["content"]["contact"]["username"]:
        #         profile = await self.get_field(participant, 'profile')
        #         if (datetime.now(timezone.utc) - (await self.get_field(profile, 'last_active_time'))).seconds > 5 * 60:
        #             loop = asyncio.get_event_loop()
        #             future1 = loop.run_in_executor(None, send_notification, participant, text)
        #             future2 = loop.run_in_executor(None, send_browser_notification, participant, text)
        #             resp1 = await future1
        #             resp2 = await future2
        #             # send_notification(user=participant, text=text)
        #             # send_browser_notification(user=participant, text=text)
        # finish = datetime.now()
        # print(f'time taken: {(finish - start).microseconds}')


    async def update_last_read_messages(self, data):
        # logger.debug("Updating last read message!")
        # logger.debug(data)
        user = await self.get_object_or_error(model=User, name='user', username=data['username'])
        chat = await self.get_object_or_error(model=Chat, name='chat', id=data['chat_id'])
        if (not user) or (not chat):
            return
        await self.update_last_read_message(user, chat, data['last_read_message'])
        await self.send_chat_message(data)

    async def user_typing(self, data):
        await self.send_chat_message(data)

    async def update_pinned_message(self, data):
        logger.debug(f"Updating pinned message! data: {data}")
        chat = await self.get_object_or_error(model=Chat, name='chat', id=data['chat_id'])
        if not chat:
            return
        await self.set_field(chat, 'pinned_message', data['message_id'])
        try:
            message = await self.get_object_or_error(model=Message, name='message', id=data['message_id'])
            data['message'] = await message_to_json(message, False)
        except Message.DoesNotExist:
            data['message'] = {}

        await self.save(chat)
        await self.send_chat_message(data)

    # Server websocket receives from consumer websocket two commands:
    # 0) authorize: consumer (client) sends its token
    # 1) fetch_messages: consumer (client) wants the list of fetched messages
    # 2) new_message: consumer (client) sends a new message
    # 3) update_last_read_messages: consumer (client) sends the list of updated last_read_messages of the chats

    commands = {
        'authorize': authorize,
        'fetch_messages': fetch_messages,
        'new_message': new_message,
        'update_last_read_messages': update_last_read_messages,
        'user_typing': user_typing,
        'update_pinned_message': update_pinned_message,
    }

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']

        # Constructs a Channels group name directly from the user-specified room name, without any quoting or
        # escaping. Group names may only contain letters, digits, hyphens, and periods. Therefore this example code
        # will fail on room names that have other characters.
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code=1000):
        # Send offline identifier
        if self.scope['user'] and await self.get_field(self.scope['user'], 'is_authenticated'):
            now = datetime.now(timezone.utc)
            try:
                username = await self.get_field(self.scope['user'], 'username')
                profile = await self.get_object_or_error(Profile, 'profile', owner__username=username)
                await self.set_field(profile, 'last_active_time', now - timedelta(minutes=5))
                await self.save(profile)
                content = {
                    'command': 'update_last_active_time',
                    'username': username,
                    'timestamp': str(await self.get_field(profile, 'last_active_time')) + 'Z',
                }
                await self.send_chat_message(content)
            except Profile.DoesNotExist:
                pass
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.scope['user'] = None

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if (text_data_json['command'] != "authorize") and (not self.scope['user'] or not (await self.get_field(self.scope['user'], 'is_authenticated'))):
            await self.disconnect()
            return
        if self.scope['user'] and (await self.get_field(self.scope['user'], 'is_authenticated')):
            now = datetime.now(timezone.utc)
            try:
                profile = await self.get_object_or_error(Profile, 'profile', owner__username=self.scope['user'].username)
                passed_time = now - await self.get_field(profile, 'last_active_time')
                if passed_time.total_seconds() // 60 >= 3:
                    await self.set_field(profile, 'last_active_time', now)
                    await self.save(profile)
                    content = {
                        'command': 'update_last_active_time',
                        'username': self.scope['user'].username,
                        'timestamp': str(await self.get_field(profile, 'last_active_time')) + 'Z',
                    }
                    await self.send_chat_message(content)
            except Profile.DoesNotExist:
                pass

        await self.commands[text_data_json['command']](self, text_data_json)

    # Send message to room group
    async def send_chat_message(self, content):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',  # function name?
                'message': content
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        chat_id = event['message'].get('chat_id', None)
        user = self.scope['user']
        if not user or not (await self.get_field(user, 'is_authenticated')):
            return
        # if chat_id is not specified then this is just update_last_active_time command and thus we may send it to everyone (TODO: maybe fix this some time later)
        if chat_id is None:
            message = event['message']
            await self.send(text_data=json.dumps(message))
            return
        message = event['message']
        if message['command'] == 'new_message':
            chat = await self.get_object_or_error(Chat, 'chat', id=message['chat_id'])
            if not (await self.get_field(chat, 'channel')):
                channel = await self.get_object_or_error(Channel, 'channel', participants__username=(await self.get_field(user, 'username')), is_course=False)
            else:
                channel = (await self.get_field(chat, 'channel'))
            # logger.debug(f'LOLOLOLOL channel: {channel} id: {channel.id}')
            message['channel_id'] = (await self.get_field(channel, 'id'))

        # Send message to WebSocket only if the user consists in the chat
        @database_sync_to_async
        def check():
            return Chat.objects.filter(id=chat_id, participants=user).exists()

        if await check():
            await self.send(text_data=json.dumps(message))

    # Send message to the current consumer (not to the whole group)
    async def send_message(self, message):
        await self.send(text_data=json.dumps(message))

    # Send error to the current consumer (not to the whole group)
    async def send_error(self, message):
        content = {
            'command': 'error',
            'content': message
        }
        await self.send_message(content)
"""