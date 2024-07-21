from django.urls import path, re_path
from django.conf.urls import include
import private_storage.urls


from .views import (
    FileUploadView,
    MyDocumentDownloadView,
)

app_name = 'files'

urlpatterns = [
    # should specify as_view() because views are class based
    path('upload/', FileUploadView.as_view()),
    path('download/<pk>', MyDocumentDownloadView.as_view()),
]
