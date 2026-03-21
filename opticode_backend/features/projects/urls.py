from django.urls import path  # noqa: F401
from .views import ProjectListCreateView, ProjectFilesView # Importa la nueva vista


app_name = "projects"

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),
    path("<int:pk>/files/", ProjectFilesView.as_view(), name="project-files-list"),
]
