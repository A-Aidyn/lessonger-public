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

User = get_user_model()
logger = logging.getLogger(__name__)


class KaistIamCallbackHelper:
    def create_chat_user_membership(self, chat, username):
        if not chat.participants.filter(username=username).exists():
            user = User.objects.get(username=username)
            if user.profile.position != 'unknown' and user.profile.position != 'student':
                Membership.objects.create(chat=chat, user=user, is_admin=True)
            else:
                Membership.objects.create(chat=chat, user=user, is_admin=False)

    def delete_user_from_channel(self, channel, username):
        user = User.objects.get(username=username)
        for chat in Chat.objects.filter(participants__username=username, channel_id=channel.id,
                                        semester=self.get_current_semester(),
                                        year=self.get_current_year()).all():
            chat.participants.remove(user)
        channel.participants.remove(user)

    def get_current_year(self):
        return 2021
        # TODO needs fixing Fetch from here: https://portal.kaist.ac.kr/portal/default/calendar

    def get_current_semester(self):
        return '1'
        # ('1', 'spring'),
        # ('2', 'summer'),
        # ('3', 'fall'),
        # ('4', 'winter')
        # TODO needs fixing. Fetch from here: https://portal.kaist.ac.kr/portal/default/calendar

    def check_if_dropped(self, username, courses):  # what if change section?
        portal_course_codes = [i['code'] for i in courses]
        user_courses_in_db = Channel.objects.filter(participants__username=username, is_course=True)
        user_courses_codes_in_db = set([course.code for course in user_courses_in_db])
        for code in user_courses_codes_in_db:
            if code not in portal_course_codes:
                logger.debug(f'deleting user {username} from {code}')
                self.delete_user_from_channel(Channel.objects.get(code=code), username)
        # logger.debug('Check Completed')

    def obtain_chat(self, channel, semester, year, section, course_code, name=''):
        if Chat.objects.filter(channel__id=channel.id, semester=semester, year=year, section=section,
                               course_code=course_code).exists():
            return Chat.objects.get(channel__id=channel.id, semester=semester, year=year, section=section,
                                    course_code=course_code)
        else:
            return Chat.objects.create(channel=channel, name=name, semester=semester, year=year,
                                       section=section, course_code=course_code)

    def synchronize_channels(self, username, courses):
        semester = self.get_current_semester()
        year = self.get_current_year()
        for course in courses:
            if not Channel.objects.filter(code=course['code']).exists():
                channel = Channel.objects.create(name=course['name'], code=course['code'], is_course=True)
                # TODO: current year and semester 'sp', 2021,
                logger.debug('Created a new channel!')
            else:
                channel = Channel.objects.get(code=course['code'])

            chat = self.obtain_chat(channel, semester, year, '0', course['code'], course['name'])

            if not channel.participants.filter(username=username).exists():
                logger.debug('adding the user to the channel!')
                user = User.objects.get(username=username)
                channel.participants.add(user)

            self.create_chat_user_membership(chat, username)

            if course['section']:
                channel = Channel.objects.get(code=course['code'])  # Not sure if it's needed
                chat = self.obtain_chat(channel, semester, year, course['section'], course['code'], course['name'])
                self.create_chat_user_membership(chat, username)

                if Chat.objects.filter(participants__username=username, channel__id=channel.id, semester=semester,
                                       year=year, course_code=course['code']).exclude(
                                        section='0').exclude(section=course['section']).exists():
                    user = User.objects.get(username=username)
                    for chat in Chat.objects.filter(participants__username=username, channel_id=channel.id,
                                                    semester=semester,
                                                    year=year,
                                                    course_code=course['code']).exclude(section='0').exclude(
                                                    section=course['section']).all():
                        logger.debug(f'removing {user} from {chat} (other section)')
                        chat.participants.remove(user)
