from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AuthPublicKeyView,
    ChangePasswordView,
    ForgotPasswordView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    ResetPasswordView,
)

app_name = "auth"

urlpatterns = [
    path("crypto/public-key/", AuthPublicKeyView.as_view(), name="auth_public_key"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset_password"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
]
