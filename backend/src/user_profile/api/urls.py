from django.urls import path, re_path

from .views import (
    MyProfileUpdateView,
    ProfileListView,
    UserProfileFetchView
)

app_name = 'user_profile'

urlpatterns = [
    # should specify as_view() because views are class based
    path('update/', MyProfileUpdateView.as_view()),
    path('<target_username>/', UserProfileFetchView.as_view()),
    # path('', ProfileListView.as_view()),
]
