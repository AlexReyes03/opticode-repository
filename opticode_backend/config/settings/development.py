from config.settings import base as base_settings
from config.settings import logging as logging_settings

from core.logging import setup_logging

# Evita wildcard imports y mantiene todos los settings base/logging disponibles
# para Django en este módulo de desarrollo.
globals().update({key: value for key, value in vars(base_settings).items() if key.isupper()})
globals().update(
    {key: value for key, value in vars(logging_settings).items() if key.isupper()}
)

DEBUG = True

# CORS permisivo en desarrollo (Vite en :5173, Docker Nginx en :8080, IPs locales).
# En producción (DJANGO_ENV=production) no aplica este módulo.
CORS_ALLOW_ALL_ORIGINS = True

setup_logging(LOGURU_CONFIG)

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
PASSWORD_RESET_TIMEOUT = 1800  # 30 minutos
