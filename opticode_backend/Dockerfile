# ============================================================
# Dockerfile — Opticode Backend (Django + Gunicorn)
# ============================================================

FROM python:3.13-slim

# Evitar prompts interactivos durante apt
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias de sistema:
#   WeasyPrint: cairo, pango, gdk-pixbuf
#   mysqlclient: libmysqlclient-dev + build tools + pkg-config
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del proyecto
COPY . .

# Crear carpetas necesarias
RUN mkdir -p /app/logs /app/media /app/staticfiles

# Recolectar archivos estáticos al construir
# (las variables de entorno vienen del .env en runtime)
# Se hace en el entrypoint para tener acceso al .env

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
