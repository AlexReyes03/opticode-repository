from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from features.auth.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "is_staff", "is_active")
    ordering = ("email",)
