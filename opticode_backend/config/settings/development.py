from config.settings.base import *  # noqa: F401,F403
from config.settings.logging import *  # noqa: F401,F403

from core.logging import setup_logging

DEBUG = True

setup_logging(LOGURU_CONFIG)
