from config.settings.base import BASE_DIR, env

LOG_LEVEL = env("LOG_LEVEL", default="DEBUG")
LOG_DIR = str(BASE_DIR / env("LOG_DIR", default="logs"))

LOGURU_CONFIG = {
    "level": LOG_LEVEL,
    "log_dir": LOG_DIR,
    "rotation": "10 MB",
    "retention": "30 days",
    "compression": "zip",
    # Formato para archivos: detallado y sin colores para que sea parseable
    "file_format": (
        "{time:YYYY-MM-DD HH:mm:ss} | {level:<8} | {name}:{function}:{line} | {message}"
    ),
    # Formato para consola: más compacto, con colores via colorize=True
    "console_format": (
        "<green>{time:HH:mm:ss}</green> | "
        "<level>{level:<8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    ),
}

# Intercepta el logging estándar de Python (Django, DRF, etc.) y lo redirige a Loguru
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "loguru": {
            "class": "core.logging.LoguruHandler",
            "level": LOG_LEVEL,
        },
    },
    "root": {
        "handlers": ["loguru"],
        "level": LOG_LEVEL,
    },
}
