import logging

from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Count
from django.shortcuts import get_object_or_404, redirect
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


from ..models import FilesModel
from .serializers import FilesSerializer
from private_storage.views import PrivateStorageDetailView


User = get_user_model()
logger = logging.getLogger(__name__)


class MyDocumentDownloadView(APIView, PrivateStorageDetailView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)

    model = FilesModel
    model_file_field = 'file'

    def get_queryset(self):
        # Make sure only certain objects can be accessed.
        return super().get_queryset() # .filter(...) # not needed for now

    def can_access_file(self, private_file):
        logger.info(self.request.user)
        logger.info(self.request.headers)
        if self.request.user.is_anonymous:
            return False
        return self.request.user in self.get_object().chat.participants.all()


class FileUploadView(CreateAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = FilesSerializer
    
    # TODO: only users chats
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        content = serializer.data
        content['location'] = content['file']
        content['file'] = '{}/files/download/{}'.format(settings.SERVER_URL, serializer.data['id'])
        return Response(content, status=status.HTTP_201_CREATED, headers=headers)
