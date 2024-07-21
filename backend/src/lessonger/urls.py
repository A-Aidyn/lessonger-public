"""lessonger URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import include
from django.contrib import admin
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings

from dj_rest_auth.registration.views import VerifyEmailView, ConfirmEmailView
from dj_rest_auth.views import PasswordResetConfirmView
import private_storage.urls

from .api.views import MyPasswordResetView

from lessongerbot import urls as lessongerbot_urls

urlpatterns = [
    path('lessongerbot/', include(lessongerbot_urls)),

    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('chat/', include('chat.api.urls', namespace='chat')),
    path('feedback/', include('feedback.api.urls', namespace='feedback')),
    path('files/', include('files.api.urls', namespace='files')),
    path('user-profile/', include('user_profile.api.urls', namespace='user_profile')),
    path('push-notifications/', include('push_notifications.api.urls', namespace='push_notifications')),

    path('rest-auth/password/reset/', MyPasswordResetView.as_view(), name='rest_password_reset'),
    path('rest-auth/', include('dj_rest_auth.urls')),
    path('rest-auth/registration/account-confirm-email/<str:key>/', ConfirmEmailView.as_view(),),
    path('rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('rest-auth/account-confirm-email/', VerifyEmailView.as_view(), name='account_email_verification_sent'),
    path(
        'rest-auth/password/reset/confirm/<slug:uidb64>/<slug:token>/',
        PasswordResetConfirmView.as_view(), name='password_reset_confirm'
    ),

    path('private-media/', include(private_storage.urls)),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
