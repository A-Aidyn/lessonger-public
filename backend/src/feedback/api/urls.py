from django.urls import path, re_path
from django.views.generic import RedirectView

from .views import (
    FeedbackCreateView,
    FeedbackListView
)

app_name = 'feedback'

urlpatterns = [
    path('create/', FeedbackCreateView.as_view()),
    path('list/', FeedbackListView.as_view())
]
