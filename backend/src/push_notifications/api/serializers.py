import logging

from rest_framework import serializers

from push_notifications.models import Subscription

logger = logging.getLogger(__name__)


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ('payload', )

    def create(self, validated_data):
        logger.debug(validated_data)
        payload = validated_data.pop('payload')
        # print(payload)
        request = self.context.get('request')
        try:
            subscription = Subscription.objects.get(payload=payload, user=request.user)
        except Subscription.DoesNotExist:
            subscription = Subscription.objects.create(payload=payload, user=request.user)
        return subscription
