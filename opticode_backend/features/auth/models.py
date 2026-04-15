from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField("correo electrónico", unique=True)
    last_password_changed = models.DateTimeField("último cambio de contraseña", null=True, blank=True)
    
    # Campos de Tabla Auditable
    updated_at = models.DateTimeField("fecha de modificación", auto_now=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_users', verbose_name="creado por")
    updated_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_users', verbose_name="actualizado por")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "usuarios"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return self.email


class EmailLoginThrottle(models.Model):
    """
    Intentos fallidos de login por correo normalizado (persistente).
    Tras MAX intentos, locked_until bloquea nuevos intentos durante LOCK minutos.
    last_ip: última IP vista en un intento (servidor); si cambia (CGNAT/móvil), solo se actualiza.
    """

    email_normalized = models.EmailField("correo normalizado", max_length=254, unique=True, db_index=True)
    failed_attempts = models.PositiveSmallIntegerField("intentos fallidos", default=0)
    locked_until = models.DateTimeField("bloqueado hasta", null=True, blank=True)
    last_ip = models.CharField("última IP de intento", max_length=45, blank=True, default="")
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    class Meta:
        db_table = "auth_email_login_throttle"
        verbose_name = "throttle de login por email"
        verbose_name_plural = "throttles de login por email"

    def __str__(self):
        return f"{self.email_normalized} ({self.failed_attempts})"
