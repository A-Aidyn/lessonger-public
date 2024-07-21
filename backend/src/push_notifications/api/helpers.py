import requests
import logging
import json
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework import permissions, status
# Basic CRUD views
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    DestroyAPIView,
    UpdateAPIView
)
from rest_framework.views import APIView
from push_notifications.models import Subscription
from .serializers import SubscriptionCreateSerializer
from pywebpush import webpush, WebPushException

logger = logging.getLogger(__name__)

