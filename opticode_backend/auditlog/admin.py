from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('model_name', 'field_name', 'action', 'user', 'ip_address', 'timestamp')
    list_filter = ('action', 'model_name', 'user')
    search_fields = ('model_name', 'field_name', 'old_value', 'new_value', 'ip_address')
    readonly_fields = [f.name for f in AuditLog._meta.fields]
    
    # Deshabilitar permisos para que el historial sea inmutable (solo lectura)
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
