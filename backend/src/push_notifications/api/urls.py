from django.urls import path, re_path
from django.conf.urls import include
import private_storage.urls


from .views import (
    SubscribeView
)

app_name = 'push_notifications'

urlpatterns = [
    # should specify as_view() because views are class based
    path('subscribe/', SubscribeView.as_view())
]
