from django.urls import path

from .views import FileUploadView

app_name = "projects"

urlpatterns = [
    path("<int:pk>/files/upload/", FileUploadView.as_view(), name="file_upload"),
]
