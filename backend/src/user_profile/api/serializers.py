from rest_framework import serializers

from django.contrib.auth import get_user_model
from ..models import Profile


User = get_user_model()


class FetchProfileSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    anon_name = serializers.SerializerMethodField()
    anon_surname = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('name', 'surname', 'position', 'image_url', 'anon_name', 'anon_surname', 'email', 'kakao_talk_id', 'linkedin', 'last_active_time')

    def get_image_url(self, profile):
        request = self.context.get('request')
        image_url = profile.image.url
        return request.build_absolute_uri(image_url)

    def get_anon_name(self, profile):
        request = self.context.get('request')
        if profile.owner.username == request.user.username:
            return profile.anon_name
        return None

    def get_anon_surname(self, profile):
        request = self.context.get('request')
        if profile.owner.username == request.user.username:
            return profile.anon_surname
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['username'] = instance.owner.username
        return data


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('anon_name', 'anon_surname', 'image', 'email', 'kakao_talk_id', 'linkedin')
