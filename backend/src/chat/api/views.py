import requests
import logging
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Count, Model
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponseRedirect
from django.views.generic import RedirectView
from django.views import View
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
# Basic CRUD views
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    DestroyAPIView,
    UpdateAPIView
)
from rest_framework.views import APIView
from ..models import Chat, Channel, Membership, Kaistlogin
from user_profile.models import Profile
from rest_framework.authtoken.models import Token
from ..views import get_messages
from .serializers import ChannelListSerializer, ChatUpdateSerializer, ChatListSerializer, UserCoursesFetchSerializer, \
    ChatSerializerUpdate, \
    MessageSerializer, ProfileSerializer, ChatDetailViewSerializer
from ..course_fetch.academic_course_fetch import get_profile_n_courses, show
from .helpers import *

User = get_user_model()
logger = logging.getLogger(__name__)


class PrivateChatFetchView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    # serializer_class = UserProfileSerializer

    def get(self, request, *args, **kwargs):
        target_username = kwargs['target_username']
        target_user = get_object_or_404(User, username=target_username)

        chat = Chat.objects.filter(is_private=True) \
            .filter(participants=target_user) \
            .filter(participants=request.user).all()

        if request.user.username == target_username:
            logger.debug("equal")
            chat = Chat.objects.annotate(participants_count=Count('participants')) \
                .filter(is_private=True) \
                .filter(participants=target_user) \
                .filter(participants_count=1).all()
            logger.debug(chat)

        if len(chat) == 0:
            logger.debug('creating a new chat')
            assert request.user.username != target_username
            chat = Chat.objects.create(is_private=True)
            chat.participants.add(request.user)
            chat.participants.add(target_user)
        else:
            chat = chat[0]
        private_channel = request.user.channels.get(is_course=False).id
        # except Channel.DoesNotExist:
        #     logger.debug('Creating ')
        #     private_channel_model = Channel.objects.create(is_course=False)
        #     private_channel_model.participants.add(request.user)
        #     private_channel_model.save()
        #     private_channel = private_channel_model.id
        data = {
            'chat_id': chat.pk,
            'private_channel_id': private_channel
        }
        return Response(data)


class KaistIamCallbackView(APIView):
    permission_classes = (permissions.AllowAny,)
    helper = KaistIamCallbackHelper()

    def post(self, request):
        logger.debug('Received KAIST IAM2 data!!!!')
        logger.debug(request.data)
        state = request.data.get('state', '')
        try:
            user = Kaistlogin.objects.filter(state=state).order_by('-timestamp').all()[0].user
        except (Kaistlogin.DoesNotExist, IndexError) as e:
            return Response({'error': 'Cannot find the user who made a fetch query!'})
        Kaistlogin.objects.filter(state=state).delete()
        logger.debug(f"Found user: {user.username}")
        data = get_profile_n_courses(request)
        logger.debug(f"Courses data: {data}")

        if data.get('error', None):
            return Response(data)
        try:
            profile = Profile.objects.get(owner__username=user.username)
            profile.surname = data['profile'].get('surname', '')
            profile.name = data['profile'].get('name', '')
            profile.position = data['profile'].get('position', 'unknown')
            profile.save()
        except Profile.DoesNotExist:
            return Response("Couldn't find profile!")
        self.helper.synchronize_channels(user.username, data['courses'])
        self.helper.check_if_dropped(user.username, data['courses'])
        return redirect(f"{settings.FRONTEND_URL}/new-chat")


class GetKaistSsoUrl(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        logger.debug(f'[GETKAISTSSOURL] request: {request} request data: {request.data}')
        with requests.Session() as s:
            r = s.get('https://cais.kaist.ac.kr/')
            old_r = r.history[1]
            parsed_url = urlparse(old_r.url)
            queries = parsed_url.query.split('&')
            res = '{}://{}{}'.format(parsed_url.scheme, parsed_url.netloc, parsed_url.path)
            c = '?'
            for query in queries:
                key, value = query.split('=')
                if key == 'redirect_url':
                    value = f'{settings.SERVER_URL}/chat/sync/callback/'
                if key == 'state':
                    logger.debug(f"Saving user: {request.user.username} state: {value}")
                    Kaistlogin.objects.create(user=request.user, state=value)
                    # logger.debug(f"{type(value)} {value}")
                res += c + key + '=' + value
                c = '&'
            logger.debug(res)
            r = s.get(res)
        # show(r)
        return Response(r.url)


class ChatJoinView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, uuid):
        chat = get_object_or_404(Chat, uuid=uuid)
        if chat.is_private or (chat.channel and chat.channel.is_course):
            return Response({'detail': 'Cannot join the private chat!'}, status=status.HTTP_403_FORBIDDEN)
        if chat.participants.filter(username=request.user.username).exists():
            return Response({'detail': 'You are already a member of the chat!'}, status=status.HTTP_403_FORBIDDEN)
        Membership.objects.create(chat=chat, user=request.user)
        return redirect('/chat/{}'.format(chat.id))


class ChatCreateView(CreateAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    serializer_class = ChatSerializerUpdate
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_context(self):
        context = super(ChatCreateView, self).get_serializer_context()
        context.update({"request": self.request})
        return context


class ChatUpdateView(UpdateAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    # queryset = Chat.objects.all()
    serializer_class = ChatUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def get_queryset(self):
        # queryset = Chat.objects.all()
        # username = self.request.query_params.get('username', None)  # in url /chat/?username=admin
        # if username is not None:
        # related name of participants in models is 'chats'. So we are getting a list of Chat objects by
        # referencing the chats related name on the contact. Contacts is the model that we are referencing in
        # ManyToMany field
        #    logger.debug("In ChatListView username: {}".format(username))
        #    queryset = Chat.objects.filter(participants__username=username)
        queryset = self.request.user.chats.filter(channel=None).all()
        return queryset


"""
class ChatDeleteView(DestroyAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = (permissions.IsAuthenticated, )
"""


class ChatLeaveView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        chat = get_object_or_404(Chat, pk=pk)
        chat.participants.remove(request.user)
        return redirect('/chat/channel/')


#######################################################


class ChannelListView(ListAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    serializer_class = ChannelListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    # Our custom queryset
    def get_queryset(self):
        queryset = self.request.user.channels.all()
        return queryset

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        ans = []
        for channel in queryset:
            ans.append(ChannelListSerializer(channel, context={'request': request}).data)
        return Response(ans)


class ChatListView(ListAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    serializer_class = ChatListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    # Our custom queryset
    def get_queryset(self, **kwargs):
        if Channel.objects.filter(id=kwargs.get('channel_id', 0), participants=self.request.user).exists():
            queryset = Chat.objects.filter(channel__id=kwargs.get('channel_id', 0),
                                           participants=self.request.user).all()
            return queryset
        else:
            return []

    def get(self, request, *args, **kwargs):
        logger.debug(Token.objects.all())
        # logger.debug(User.objects.all())
        #  TODO: Problems with encoding (Not ASCII chars in username)
        #  TODO: Use u' '.join(User.objects.all()).encode('utf-8').strip() instead
        logger.debug(f"Request user profile: {request.user.profile} image: {request.user.profile.image}")
        queryset = self.get_queryset(channel_id=kwargs['channel_id'])
        a = []
        for chat in queryset:
            ans = ChatListSerializer(chat, context={'request': request}).data
            a.append(ans)

        try:
            channel = Channel.objects.get(id=kwargs.get('channel_id', 0), participants=self.request.user)
        except Channel.DoesNotExist:
            return Response(a)

        if not channel.is_course:
            # Adding chats of the user (Not course chats)
            custom_chats = Chat.objects.filter(participants=self.request.user, channel=None).all()
            for chat in custom_chats:
                ans = ChatListSerializer(chat, context={'request': request}).data
                # logger.debug(f"{chat.is_private}, {chat.participants.count()}")
                # if chat.is_private and chat.participants.count() == 2 and chat.messages.count() == 0:
                #     continue
                if chat.is_private and chat.participants.count() == 2:
                    target_user = chat.participants.all().exclude(username=request.user.username)[0]
                    # TODO: check these later (Amazon S3)
                    ans['target_user_contact'] = ProfileSerializer(target_user.profile).data
                    ans['image'] = ans['target_user_contact']['image']

                a.append(ans)

        return Response(a)


class ChatDetailView(RetrieveAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    serializer_class = ChatDetailViewSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = self.request.user.chats.all()
        return queryset


class ChatDetailUUIDView(RetrieveAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    serializer_class = ChatDetailViewSerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'uuid'

    def get_queryset(self):
        queryset = Chat.objects.filter(channel=None, is_private=False).all()
        return queryset