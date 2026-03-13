from config.settings.base import *  # noqa: F401,F403
from config.settings.logging import *  # noqa: F401,F403

from core.logging import setup_logging

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
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

setup_logging(LOGURU_CONFIG)
