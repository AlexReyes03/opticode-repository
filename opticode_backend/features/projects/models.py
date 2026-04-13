from django.conf import settings
from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campos de Tabla Auditable
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='created_projects', verbose_name="creado por"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='updated_projects', verbose_name="actualizado por"
    )

    class Meta:
        db_table = "proyectos"
        verbose_name = "proyecto"
        verbose_name_plural = "proyectos"

    def __str__(self):
        return self.name
