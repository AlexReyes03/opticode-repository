import logging
import sys
from pathlib import Path


from loguru import logger


class LoguruHandler(logging.Handler):
    """Bridge entre el logging estándar de Python/Django y Loguru."""

    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging(config: dict):
    """Inicializa Loguru con la configuración proveniente de LOGURU_CONFIG en settings.

    Claves esperadas en *config* (todas requeridas desde settings):
        level, log_dir, rotation, retention, compression,
        file_format, console_format
    """
    level: str = config["level"]
    log_dir = Path(config["log_dir"])
    rotation: str = config["rotation"]
    retention: str = config["retention"]
    compression: str = config["compression"]
    file_format: str = config["file_format"]
    console_format: str = config["console_format"]

    logger.remove()

    # Salida en consola con colores y formato corto
    logger.add(
        sys.stderr,
        level=level,
        format=console_format,
        colorize=True,
    )

    # Salida a archivo con formato detallado, rotación y compresión
    log_dir.mkdir(parents=True, exist_ok=True)
    logger.add(
        str(log_dir / "opticode_{time:YYYY-MM-DD}.log"),
        level=level,
        format=file_format,
        rotation=rotation,
        retention=retention,
        compression=compression,
        encoding="utf-8",
    )

    return logger
