from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    # Nombre del dato
    model_name = models.CharField(max_length=100)
    field_name = models.CharField(max_length=100)
    
    # Tipo de movimiento
    action = models.CharField(max_length=10, choices=[
        ('INSERT', 'Insert'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ])
    
    record_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Primary key of the modified record in its original table"
    )
    
    # Valor(es)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    
    # Fecha y hora
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Host origen
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Usuario
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"[{self.timestamp}] {self.action} on {self.model_name}.{self.field_name} by {self.user}"
