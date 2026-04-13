# ============================================================
# Dockerfile — Opticode Backend (Django + Gunicorn)
# ============================================================

FROM python:3.13-slim

# Evitar prompts interactivos durante apt
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencias de sistema
# - WeasyPrint necesita cairo, pango, gdk-pixbuf
# - mysqlclient necesita libmysqlclient-dev + build tools
# - pkg-config requerido por mysqlclient
RUN apt-get update && apt-get install -y --no-install-recommends \
    # WeasyPrint
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    # mysqlclient
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    # Limpieza
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
