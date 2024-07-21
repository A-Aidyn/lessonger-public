import logging

from rest_framework import serializers

from feedback.models import Feedback

logger = logging.getLogger(__name__)


class FeedbackListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ('content', 'timestamp')


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ('content', )

    def create(self, validated_data):
        logger.debug(validated_data)
        content = validated_data.pop('content')
        feedback = Feedback.objects.create(content=content)
        return feedback
