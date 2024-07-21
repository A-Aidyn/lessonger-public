from django.urls import path, re_path
from django.views.generic import RedirectView

from .views import (
    ChatListView,
    ChatDetailView,
    ChatCreateView,
    ChatUpdateView,
    # ChatDeleteView,
    ChatJoinView,
    ChatLeaveView,
    PrivateChatFetchView,
    ChannelListView,
    ChatDetailUUIDView,
    KaistIamCallbackView, GetKaistSsoUrl,
)

app_name = 'chat'

urlpatterns = [
    # should specify as_view() because views are class based
    # path('go/to/front/', RedirectView.as_view(url='http://localhost:1234/new-chat')),
    path('channel/', ChannelListView.as_view()),
    path('channel/<channel_id>/', ChatListView.as_view()),
    path('create/', ChatCreateView.as_view()),
    path('join/<uuid>/', ChatJoinView.as_view()),
    path('uuid/<uuid>/', ChatDetailUUIDView.as_view()),
    path('sync/', GetKaistSsoUrl.as_view()),
    path('sync/callback/', KaistIamCallbackView.as_view()),
    path('with/<target_username>/', PrivateChatFetchView.as_view()),
    path('<pk>/', ChatDetailView.as_view()),
    path('<pk>/update/', ChatUpdateView.as_view()),
    path('<pk>/leave/', ChatLeaveView.as_view()),
    
    # path('<pk>/update/', ChatUpdateView.as_view()),
    # path('<pk>/delete/', ChatDeleteView.as_view()),
    
]
