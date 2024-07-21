import logging

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework import serializers
from rest_framework import status

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from dj_rest_auth.views import PasswordResetView
User = get_user_model()

logger = logging.getLogger(__name__)



class MyPasswordResetView (PasswordResetView):
    def post(self, request, *args, **kwargs):

        email = request.data['email']
        logger.info (email)

        user = User.objects.filter(email=email).first()
        logger.info (user)
        if user is None:
            return Response({'detail': 'No such user is registered'})
        else:

        # Create a serializer with request.data
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            serializer.save()
        # Return the success message with OK HTTP status

            return Response(
                {"detail": "Password reset e-mail has been sent."},
                status=status.HTTP_200_OK
            )  
