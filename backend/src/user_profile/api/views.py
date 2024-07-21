import logging

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404, redirect
from django.http import JsonResponse
from rest_framework import permissions, status
from rest_framework.response import Response
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
from ..models import Profile
from .serializers import ProfileSerializer, FetchProfileSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class ProfileListView(ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = (permissions.AllowAny, )
    queryset = Profile.objects.all()


class UserProfileFetchView(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = (permissions.AllowAny, )
    # serializer_class = UserProfileSerializer

    def get(self, request, *args, **kwargs):
        target_username = kwargs['target_username']
        user_profile = get_object_or_404(Profile, owner__username=target_username)

        return Response(FetchProfileSerializer(user_profile, context={'request': request}).data)


class MyProfileUpdateView(UpdateAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated, )

    def put(self, request, *args, **kwargs):
        logger.debug(f'UPDATING USER!!! request: {request} request_data: {request.data}')
        return super().put(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        logger.debug(f'[PATCH] UPDATING USER!!! request: {request} request_data: {request.data}')
        return super().patch(request, *args, **kwargs)

    def get_object(self):
        user = self.request.user
        return Profile.objects.get(owner=user)

    def get_queryset(self):
        #queryset = Profile.objects.all()
        user = self.request.user
        queryset = Profile.objects.get(owner=user)
        return queryset
