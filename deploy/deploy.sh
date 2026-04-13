#!/bin/bash
# ============================================================
# deploy.sh — Actualizar backend de Opticode en EC2 (Docker)
# Ejecutar desde /home/ubuntu/opticode/
#
# Nota: el frontend se actualiza manualmente en Cloudflare Pages.
#
# Uso: bash deploy/deploy.sh
# ============================================================

set -e

DEPLOY_DIR="/home/ubuntu/opticode"

echo "=== [1/3] Actualizando código desde git ==="
cd $DEPLOY_DIR
git pull origin main

echo "=== [2/3] Reconstruyendo y reiniciando contenedores ==="
cd $DEPLOY_DIR/deploy
docker compose up -d --build

echo "=== [3/3] Estado de los contenedores ==="
docker compose ps

echo ""
echo "=== Deploy completado ==="
echo "Recuerda: si hubo cambios en el frontend, súbelos manualmente a Cloudflare Pages."
