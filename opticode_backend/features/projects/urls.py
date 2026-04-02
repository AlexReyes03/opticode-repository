from django.urls import path

from .views import FileUploadView, ZipUploadView, ProjectExportExcelView

app_name = "projects"

urlpatterns = [
    path("<int:pk>/files/upload/", FileUploadView.as_view(), name="file_upload"),
    path("<int:pk>/files/upload-zip/", ZipUploadView.as_view(), name="file_upload_zip"),
    path("<int:pk>/export/", ProjectExportExcelView.as_view(), name="project_export"),
]
