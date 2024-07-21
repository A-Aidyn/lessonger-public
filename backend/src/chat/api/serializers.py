import base64
import io
import logging

from PIL import Image
from rest_framework import serializers

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from ..models import Chat, Message, Channel, Membership
from user_profile.models import Profile

User = get_user_model()
logger = logging.getLogger(__name__)


class ChatUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ('name', 'image')


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('name', 'surname', 'image', 'position', 'last_active_time')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['username'] = instance.owner.username
        # TODO: check these later (Amazon S3)
        # request = self.context.get('request', None)
        # if request:
        #     data['image'] = request.build_absolute_uri(data['image'])
        return data


class SimpleMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        exclude = ['chat']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request', None)
        data['contact'] = ProfileSerializer(instance.contact.profile, context={'request': request}).data
        if instance.content_type == 'i':
            data['content'] = 'Attached image'
        return data


class MessageSerializer(serializers.ModelSerializer):
    # contact = ProfileSerializer()

    class Meta:
        model = Message
        exclude = ['chat']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request', None)
        logger.debug(f"[BEF] Profile: {instance.contact.profile} image: {instance.contact.profile.image}")
        data['contact'] = ProfileSerializer(instance.contact.profile, context={'request': request}).data
        logger.debug(f"[AFT] Profile: {instance.contact.profile} image: {instance.contact.profile.image}")

        try:
            message = Message.objects.get(id=instance.reply_to)
            data['reply_to'] = SimpleMessageSerializer(message).data
        except Message.DoesNotExist:
            data['reply_to'] = {}
        return data


class UserCoursesFetchSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255,style={'input_type': 'password'})
    # year = serializers.CharField(max_length=255)
    # semester = serializers.CharField(max_length=255)


class ContactSerializer(serializers.StringRelatedField):
    def to_internal_value(self, data):
        return data


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)

    class Meta:
        model = User
        fields = ('username', 'last_login', 'email', 'profile')


class ChatDetailViewSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True)

    class Meta:
        model = Chat
        fields = ('uuid', 'name', 'is_private', 'image', 'participants', 'pinned_message', 'section')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for participant in data['participants']:
            is_admin = False
            try:
                is_admin = Membership.objects.get(chat=instance, user__username=participant['username']).is_admin
            except Membership.DoesNotExist:
                logger.debug("Can't find membership!")
            participant['is_admin'] = is_admin
        if instance.channel:
            data['is_channel_course'] = instance.channel.is_course
        else:
            data['is_channel_course'] = False
        return data

# ChatSerializer extends from the default rest framework serializer

class ChatSerializerUpdate(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ('name', 'image')

    def create(self, validated_data):
        logger.debug(validated_data)
        chat_name = validated_data.pop('name')
        try:
            image = validated_data.pop('image')
        except KeyError:
            image = None
        if image:
            chat = Chat(name=chat_name, image=image)
        else:
            chat = Chat(name=chat_name)
        chat.save()
        request = self.context.get('request')
        Membership.objects.create(chat=chat, user=request.user, is_admin=True)
        logger.debug(chat.participants.all())
        return chat
######################################################################


class ChannelListSerializer(serializers.ModelSerializer):
    # participants = ContactSerializer(many=True)

    class Meta:
        model = Channel
        fields = ('id', 'name', 'code', 'is_course', 'image')
        # read_only = ('id', 'is_KLMS_course', 'is_private')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # logger.debug(f'printing chats of {instance.name}')
        request = self.context.get('request', None)
        total_unread_count = 0
        for chat in instance.chats.all():
            try:
                if request:
                    membership = Membership.objects.get(chat=chat, user__username=request.user.username)
                    cnt = chat.messages.filter(id__gt=membership.last_read_message).count()
                    total_unread_count += cnt
                else:
                    raise Membership.DoesNotExist
            except Membership.DoesNotExist:
                pass

        if not instance.is_course:
            for chat in Chat.objects.filter(channel=None, participants__username=request.user.username):
                try:
                    if request:
                        membership = Membership.objects.get(chat=chat, user__username=request.user.username)
                        cnt = chat.messages.filter(id__gt=membership.last_read_message).count()
                        total_unread_count += cnt
                    else:
                        raise Membership.DoesNotExist
                except Membership.DoesNotExist:
                    pass
        data['unread_count'] = total_unread_count
        return data


class ChatListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ('id', 'name', 'is_private', 'image', 'type', 'pinned_message', 'creation_time', 'section', 'course_code')

    def message_to_json(self, message):
        res = MessageSerializer(message).data
        # TODO: check these later (Amazon S3)
        # request = self.context.get('request', None)
        # res['contact']['image'] = request.build_absolute_uri(res['contact']['image'])
        if message.content_type == 'i':
            res['content'] = 'Attached image'
        return res

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request', None)
        # TODO: check these later (Amazon S3)
        # if request:
        #     data['image'] = request.build_absolute_uri(data['image'])
        try:
            last_message = instance.messages.order_by('-timestamp').all()[0]
        except IndexError:
            last_message = {}
        if last_message:
            last_message = MessageSerializer(last_message, context={'request': request}).data

        try:
            tmp = Membership.objects.order_by('-last_read_message').exclude(user=request.user).filter(chat=instance)
            # logger.debug(tmp)
            max_last_read_message = tmp[0].last_read_message
        except (Membership.DoesNotExist, IndexError):
            max_last_read_message = 0

        if instance.participants.count() == 1:
            max_last_read_message = last_message.get('id', 0)
        # logger.debug(max_last_read_message)
        data['max_last_read_message'] = max_last_read_message
        data['last_message'] = last_message
        data['participants_count'] = instance.participants.count()

        # if this is a dialog then we change the name of the chat to the opposite user's username
        if data['participants_count'] == 2 and data['is_private']:
            opposite_user = instance.participants.all().exclude(username=request.user.username)[0]
            data['name'] = opposite_user.username

        try:
            if request:
                membership = Membership.objects.get(chat=instance, user=request.user)
            else:
                raise Membership.DoesNotExist
        except Membership.DoesNotExist:
            membership = None

        if membership:
            cnt = instance.messages.filter(id__gt=membership.last_read_message).count()
            data['last_read_message'] = membership.last_read_message
            data['unread_count'] = cnt

        try:
            message = Message.objects.get(id=data['pinned_message'])
            data['pinned_message'] = self.message_to_json(message)
        except Message.DoesNotExist:
            data['pinned_message'] = {}

        if instance.channel:
            data['is_channel_course'] = instance.channel.is_course
        else:
            data['is_channel_course'] = False

        return data

