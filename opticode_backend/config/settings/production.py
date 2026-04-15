from config.settings import base as base_settings
from config.settings import logging as logging_settings

from core.logging import setup_logging


def _load_uppercase_settings(module):
    for name, value in vars(module).items():
        if name.isupper():
            globals()[name] = value


_load_uppercase_settings(base_settings)
_load_uppercase_settings(logging_settings)

DEBUG = False

# En producción ALLOWED_HOSTS debe definirse explícitamente en el .env
# Ejemplo: ALLOWED_HOSTS=opticode.com,www.opticode.com

# Cabeceras de seguridad HTTP
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
# SSL redirect desactivado: Nginx termina las conexiones y no hay HTTPS aún.
# Activar cuando se configure certificado SSL en Nginx.
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

setup_logging(LOGURU_CONFIG)
