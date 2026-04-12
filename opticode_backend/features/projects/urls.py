from django.urls import path

from .views import (
    FileUploadView,
    ProjectExportExcelView,
    ProjectFileListView,
    ProjectListCreateView,
    ProjectRetrieveUpdateView,
    ProjectUploadedFileDestroyView,
    ZipUploadView,
)

app_name = "projects"

urlpatterns = [
    path("<int:pk>/files/upload/", FileUploadView.as_view(), name="file_upload"),
    path("<int:pk>/files/upload-zip/", ZipUploadView.as_view(), name="file_upload_zip"),
    path(
        "<int:pk>/files/<int:file_id>/",
        ProjectUploadedFileDestroyView.as_view(),
        name="project_file_destroy",
    ),
    path("<int:pk>/files/", ProjectFileListView.as_view(), name="project_file_list"),
    path("<int:pk>/export/", ProjectExportExcelView.as_view(), name="project_export"),
    path("<int:pk>/", ProjectRetrieveUpdateView.as_view(), name="project_detail"),
    path("", ProjectListCreateView.as_view(), name="project_list"),
]
