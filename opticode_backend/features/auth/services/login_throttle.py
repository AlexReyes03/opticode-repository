"""
Control de intentos de login por email (BD + select_for_update).
"""

from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response

from ..models import EmailLoginThrottle

MAX_ATTEMPTS = int(getattr(settings, "LOGIN_THROTTLE_MAX_ATTEMPTS", 5))
LOCK_MINUTES = int(getattr(settings, "LOGIN_THROTTLE_LOCK_MINUTES", 30))

LOCKED_MESSAGE = "Tu cuenta ha sido bloqueada temporalmente por actividad sospechosa."
CREDENTIALS_MESSAGE = "Credenciales inválidas."


def _locked_response():
    return Response(
        {"error": LOCKED_MESSAGE, "locked": True},
        status=status.HTTP_403_FORBIDDEN,
    )


def normalize_login_email(email: str) -> str:
    return (email or "").strip().lower()


def get_client_ip(request) -> str | None:
    """
    IP del cliente vista por Django (sin geolocalización del navegador).
    Tras proxy inverso, suele llegar en X-Forwarded-For (primer salto).
    """
    if request is None:
        return None
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        first = xff.split(",")[0].strip()
        if first:
            return first[:45]
    addr = (request.META.get("REMOTE_ADDR") or "").strip()
    return addr[:45] if addr else None


def check_login_throttle_before_auth(request, email_normalized: str) -> Response | None:
    """
    Si el correo está bloqueado, devuelve 403. Si el bloqueo expiró, resetea contadores.
    Si no hay fila, no crea una (solo lectura / unlock).
    """
    client_ip = get_client_ip(request)
    with transaction.atomic():
        try:
            row = EmailLoginThrottle.objects.select_for_update().get(
                email_normalized=email_normalized
            )
        except EmailLoginThrottle.DoesNotExist:
            return None

        if client_ip is not None:
            row.last_ip = client_ip

        now = timezone.now()
        if row.locked_until and row.locked_until > now:
            row.save()
            return _locked_response()

        if row.locked_until and row.locked_until <= now:
            row.failed_attempts = 0
            row.locked_until = None
            row.save()
        elif client_ip is not None:
            row.save(update_fields=["last_ip", "updated_at"])

    return None


def record_failed_login(request, email_normalized: str) -> Response:
    """
    Incrementa intentos fallidos. Si alcanza MAX_ATTEMPTS, fija bloqueo 30 min y 403.
    En caso contrario 401 con failed_attempt (1..MAX_ATTEMPTS-1).
    """
    client_ip = get_client_ip(request)
    with transaction.atomic():
        row, _ = EmailLoginThrottle.objects.select_for_update().get_or_create(
            email_normalized=email_normalized,
            defaults={"failed_attempts": 0, "locked_until": None, "last_ip": client_ip},
        )
        now = timezone.now()

        if client_ip is not None:
            row.last_ip = client_ip

        if row.locked_until and row.locked_until > now:
            row.save()
            return _locked_response()

        if row.locked_until and row.locked_until <= now:
            row.failed_attempts = 0
            row.locked_until = None

        row.failed_attempts += 1

        if row.failed_attempts >= MAX_ATTEMPTS:
            row.locked_until = now + timedelta(minutes=LOCK_MINUTES)
            row.save()
            return _locked_response()

        n = row.failed_attempts
        row.save()

    return Response(
        {"error": CREDENTIALS_MESSAGE, "failed_attempt": n},
        status=status.HTTP_401_UNAUTHORIZED,
    )


def clear_login_throttle(email_normalized: str) -> None:
    """Elimina el registro de intentos tras un login correcto."""
    EmailLoginThrottle.objects.filter(email_normalized=email_normalized).delete()
