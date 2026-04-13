#!/bin/bash
# ============================================================
# entrypoint.sh — Inicio del contenedor Django
# ============================================================
set -e

echo "=== Aplicando migraciones ==="
python manage.py migrate --noinput

echo "=== Recolectando archivos estáticos ==="
python manage.py collectstatic --noinput --clear

echo "=== Iniciando Gunicorn ==="
exec gunicorn \
    --workers 2 \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    config.wsgi:application
