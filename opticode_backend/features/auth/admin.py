from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from features.auth.models import EmailLoginThrottle, User


@admin.register(EmailLoginThrottle)
class EmailLoginThrottleAdmin(admin.ModelAdmin):
    list_display = ("email_normalized", "failed_attempts", "locked_until", "last_ip", "updated_at")
    search_fields = ("email_normalized",)
    readonly_fields = ("updated_at",)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "is_staff", "is_active")
    ordering = ("email",)
