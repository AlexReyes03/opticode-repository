from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("features.auth.urls")),
    path("api/users/", include("features.users.urls")),
    path("api/projects/", include("features.projects.urls")),
    path("api/audit/", include("features.audit.urls")),
]
