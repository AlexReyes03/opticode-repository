from django.urls import path  # noqa: F401
from .views import ProjectListCreateView

app_name = "projects"

urlpatterns = [
    path("", ProjectListCreateView.as_view(), name="project-list-create"),

]
