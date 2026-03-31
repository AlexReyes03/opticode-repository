from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/", include("features.auth.urls")),
    path("api/users/", include("features.users.urls")),
    path("api/projects/", include("features.projects.urls")),
    path("api/audit/", include("features.audit.urls")),
]
