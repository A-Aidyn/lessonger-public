import requests
import logging
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

logger = logging.getLogger(__name__)


class SubscribeView(CreateAPIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]
    serializer_class = SubscriptionCreateSerializer
    queryset = Subscription.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_context(self):
        context = super(SubscribeView, self).get_serializer_context()
        context.update({"request": self.request})
        return context

