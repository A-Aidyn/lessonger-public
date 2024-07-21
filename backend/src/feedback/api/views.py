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
from feedback.models import Feedback
from .serializers import FeedbackCreateSerializer, FeedbackListSerializer

logger = logging.getLogger(__name__)


class FeedbackListView(ListAPIView):
    serializer_class = FeedbackListSerializer
    queryset = Feedback.objects.all()


class FeedbackCreateView(CreateAPIView):
    serializer_class = FeedbackCreateSerializer
    queryset = Feedback.objects.all()
    permission_classes = (permissions.AllowAny,)
