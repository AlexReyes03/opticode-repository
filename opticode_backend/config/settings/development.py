from config.settings.base import *  # noqa: F401,F403
from config.settings.logging import *  # noqa: F401,F403

from core.logging import setup_logging

DEBUG = True

setup_logging(LOGURU_CONFIG)

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
PASSWORD_RESET_TIMEOUT = 1800  # 30 minutos
