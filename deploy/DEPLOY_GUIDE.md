# Guía de Despliegue — Opticode en AWS Free Tier

## Arquitectura final

```
Internet
   │
   ├─── Frontend ──→ Cloudflare Pages (CDN global, gratis) ←── npm run build + subida manual
   │
   └─── [Internet Gateway]
              │
         [VPC default — subnet pública]
              │
         EC2 t2.micro  (IP pública)
          ├── nginx          :80   (público — API)
          ├── gunicorn        :8000 (interno, no expuesto)
          ├── Grafana         :3000 (público — login requerido)
          ├── Prometheus      :9090 (solo tu IP)
          └── mysqld_exporter :9104 (solo tu IP)
              │
         [VPC — subnet privada / misma VPC]
              │
         RDS MySQL t3.micro  (sin IP pública)
          └── puerto 3306 solo accesible desde EC2
```

> ⚠️ **NUNCA instales NAT Gateway** — no es Free Tier y cuesta ~$32 USD/mes.

**Servicios que usarás:**
| Servicio | Uso | Costo |
|----------|-----|-------|
| EC2 t2.micro | Backend + monitoreo | Gratis (Free Tier 1er año) |
| RDS MySQL t3.micro | Base de datos | Gratis (Free Tier 1er año) |
| VPC default | Red privada | Siempre gratis |
| Cloudflare Pages | Frontend React | **Siempre gratis** (sin límite de tiempo) |

---

## Nota sobre memoria (t2.micro = 1 GB RAM)

Con Grafana dentro de la EC2, el consumo estimado es:

| Proceso | RAM |
|---------|-----|
| Gunicorn (Django, 2 workers) | ~200 MB |
| Nginx | ~15 MB |
| Prometheus | ~120 MB |
| Grafana | ~200 MB |
| node_exporter + mysqld_exporter | ~30 MB |
| **Total** | **~565 MB** |

Esto cabe bien en condiciones normales, pero cuando Django procesa un ZIP grande (WeasyPrint + NLTK) puede puntear a 700-800 MB. Por eso **es obligatorio configurar swap** antes de instalar Grafana (ver sección 2.1).

---

## FASE 1 — Crear recursos en AWS (consola web)

### 1.1 Crear Key Pair (SSH)

1. Abre **EC2 → Key Pairs → Create key pair**
2. Nombre: `opticode-key`, tipo: RSA, formato: `.pem`
3. Descárgalo y guárdalo: `chmod 400 opticode-key.pem`

### 1.2 Sobre la VPC

AWS crea automáticamente una **VPC default** en cada región. Para este proyecto **no necesitas crear una VPC nueva** — la default es suficiente y ya tiene Internet Gateway configurado.

Lo que sí importa es cómo configuras los **Security Groups** (son el firewall real):

- **EC2** tendrá IP pública (para que nginx responda en el puerto 80).
- **RDS** tendrá `Public access: NO` — solo accesible desde dentro de la VPC (tu EC2).

Eso ya te da la separación correcta sin necesidad de configurar subnets privadas manualmente.

### 1.3 Crear Security Group para EC2

**EC2 → Security Groups → Create security group**

- Nombre: `opticode-ec2-sg`
- VPC: la VPC default

Reglas de entrada:

| Tipo | Puerto | Origen | Para qué |
|------|--------|--------|----------|
| SSH | 22 | My IP | Acceso SSH a la EC2 |
| HTTP | 80 | 0.0.0.0/0 | Nginx (API pública) |
| Custom TCP | 3000 | 0.0.0.0/0 | **Grafana** (público, protegido con login) |
| Custom TCP | 9090 | My IP | Prometheus UI (solo tú) |

> ℹ️ Grafana es seguro exponerlo públicamente porque requiere usuario y contraseña.
> ⚠️ Prometheus (9090) sigue siendo solo tu IP — no tiene autenticación propia.

### 1.4 Crear RDS MySQL

**RDS → Create database**

- Engine: MySQL 8.0
- Template: **Free tier**
- DB instance class: `db.t3.micro`
- DB instance identifier: `opticode-db`
- Master username: `admin`
- Master password: (pon uno seguro y guárdalo)
- Storage: 20 GB gp2 (el mínimo free tier)
- VPC: la VPC default
- **Public access: NO** ← muy importante
- VPC security group: crea uno nuevo llamado `opticode-rds-sg`

Después de crearlo, anota el **Endpoint** (algo como `opticode-db.xxxx.us-east-1.rds.amazonaws.com`).

**Importante:** En el Security Group de RDS (`opticode-rds-sg`), agrega UNA SOLA regla de entrada:
- Tipo: MySQL/Aurora, Puerto: 3306
- Origen: **el Security Group de EC2** (`opticode-ec2-sg`) — no una IP, sino el SG en sí

Así, si la IP de tu EC2 cambia, la regla sigue funcionando.

### 1.5 Crear EC2

**EC2 → Launch Instance**

- Nombre: `opticode-backend`
- AMI: **Ubuntu Server 24.04 LTS** (Free Tier eligible)
- Instance type: `t2.micro`
- Key pair: `opticode-key`
- Security group: `opticode-ec2-sg`
- Storage: 8 GB gp2 (suficiente)
- Network: VPC default, subnet pública (cualquiera), **Auto-assign public IP: Enable**

Anota la **IP pública** después de lanzarla.

### 1.6 Crear cuenta en Cloudflare Pages (para el frontend)

1. Ve a [pages.cloudflare.com](https://pages.cloudflare.com) y crea una cuenta gratuita
2. No necesitas configurar nada más por ahora — lo haces en la Fase 3 cuando tengas el build listo

---

## FASE 2 — Configurar la EC2 con Docker

Conéctate por SSH:
```bash
ssh -i opticode-key.pem ubuntu@TU_IP_PUBLICA_EC2
```

### 2.1 Swap y Docker

**Primero el swap** — con todos los contenedores en 1 GB de RAM es obligatorio:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verificar
free -h   # debe mostrar Swap: 2.0G
```

**Instalar Docker y herramientas mínimas:**

```bash
sudo apt update && sudo apt upgrade -y

# Docker (instalación oficial)
curl -fsSL https://get.docker.com | sudo sh

# Agregar tu usuario al grupo docker (sin sudo)
sudo usermod -aG docker ubuntu

# AWS CLI (para subir el frontend a S3)
sudo apt install -y awscli git

# Aplicar el grupo sin cerrar sesión
newgrp docker
```

### 2.2 Clonar el repositorio

```bash
cd /home/ubuntu
git clone https://github.com/TU_USUARIO/TU_REPO.git opticode
cd opticode
```

### 2.3 Crear la base de datos en RDS

Conéctate a RDS desde la EC2 (RDS no es público, pero la EC2 sí puede llegar):

```bash
sudo apt install -y mysql-client
mysql -h TU_ENDPOINT_RDS -u admin -p
```
```sql
CREATE DATABASE opticode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2.4 Configurar variables de entorno

```bash
# Archivo .env del backend
cp /home/ubuntu/opticode/deploy/.env.production.example \
   /home/ubuntu/opticode/opticode_backend/.env
nano /home/ubuntu/opticode/opticode_backend/.env
```

Rellena todos los valores. Para generar el SECRET_KEY:

```bash
docker run --rm python:3.13-slim python -c \
  "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Agrega también `GRAFANA_PASSWORD` al archivo `.env` del backend o expórtala:

```bash
# Al final del archivo .env del backend agrega:
GRAFANA_PASSWORD=TU_PASSWORD_GRAFANA_SEGURO
```

### 2.5 Configurar mysqld_exporter

```bash
nano /home/ubuntu/opticode/deploy/mysqld_exporter.env
# Rellena DATA_SOURCE_NAME con las credenciales del usuario prometheus en RDS
```

Crea el usuario de monitoreo en RDS:

```bash
mysql -h TU_ENDPOINT_RDS -u admin -p
```
```sql
CREATE USER 'prometheus'@'%' IDENTIFIED BY 'TU_PASSWORD_MONITOREO';
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'prometheus'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 2.6 Levantar todos los servicios

```bash
cd /home/ubuntu/opticode/deploy

# Construir imagen de Django e iniciar todo
docker compose up -d --build

# Ver que todos los contenedores estén en estado "Up"
docker compose ps
```

Deberías ver algo como:

```
NAME                STATUS
deploy-web-1        Up (healthy)
deploy-nginx-1      Up
deploy-prometheus-1 Up
deploy-grafana-1    Up
deploy-mysqld_exporter-1  Up
```

### 2.7 Crear superusuario Django

```bash
docker compose exec web python manage.py create_dev_superuser
```

### 2.8 Verificar

```bash
# API responde
curl http://localhost/api/auth/login/

# Logs en tiempo real
docker compose logs -f web
```

**Prueba:** Abre `http://TU_IP_PUBLICA_EC2/api/auth/login/` — debe responder JSON.

---

## FASE 3 — Desplegar el Frontend en Cloudflare Pages

Esto lo haces **desde tu máquina local**.

### 3.1 Configurar la URL del API en el frontend

Busca en `opticode_frontend/src/api/` donde se define la URL base y cámbiala a la IP de tu EC2:

```javascript
// En fetch-wrapper.js o donde esté la URL base:
const API_BASE = 'http://TU_IP_PUBLICA_EC2';
```

### 3.2 Construir el frontend

```bash
cd opticode_frontend
npm run build
# Genera la carpeta dist/ con los archivos estáticos
```

### 3.3 Subir a Cloudflare Pages (manualmente)

1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages → Create a project**
2. Elige **"Upload assets"** (subida directa, sin conectar git)
3. Nombre del proyecto: `opticode`
4. **Arrastra la carpeta `dist/`** completa o selecciona los archivos
5. Click en **Deploy site**

Cloudflare te dará una URL del tipo: `https://opticode.pages.dev`

### 3.4 Configurar React Router en Cloudflare Pages

React Router necesita que todas las rutas desconocidas devuelvan `index.html`. En Cloudflare Pages se hace con un archivo `_redirects`:

```bash
# Crea este archivo dentro de opticode_frontend/public/
echo "/* /index.html 200" > opticode_frontend/public/_redirects
```

Vuelve a hacer `npm run build` y sube de nuevo la carpeta `dist/`. A partir de ahora ese archivo ya estará incluido automáticamente en cada build.

### 3.5 Actualizar CORS en el backend

Ahora que el frontend tiene una URL de Cloudflare, Django debe permitirla. Edita el `.env` en la EC2:

```bash
# En /home/ubuntu/opticode/opticode_backend/.env
CORS_ALLOWED_ORIGINS=https://opticode.pages.dev
```

Reinicia el contenedor web para aplicar:
```bash
cd /home/ubuntu/opticode/deploy
docker compose restart web
```

### Para actualizar el frontend en el futuro

```bash
# Desde tu máquina local
cd opticode_frontend
npm run build
# Luego ve a dash.cloudflare.com → Pages → opticode → Create new deployment
# y sube la carpeta dist/ de nuevo
```

---

## FASE 4 — Monitoreo (ya incluido en Docker Compose)

> Con Docker, **Prometheus, Grafana y mysqld_exporter ya están corriendo** desde que ejecutaste `docker compose up -d` en la Fase 2. No necesitas instalar nada más.

Verifica que los contenedores de monitoreo estén activos:

```bash
cd /home/ubuntu/opticode/deploy
docker compose ps
# prometheus, grafana y mysqld_exporter deben aparecer como "Up"
```

Revisa que Prometheus recibe métricas de MySQL:

```bash
# Desde la EC2
curl -s http://localhost:9090/api/v1/targets | python3 -m json.tool | grep "health"
# Debe mostrar "up" para el job "mysql"
```

**Acceder a Grafana:**
Abre `http://TU_IP_PUBLICA_EC2:3000` en tu navegador (accesible desde cualquier IP).
- Usuario: `admin`
- Password: el valor de `GRAFANA_PASSWORD` que pusiste en el `.env`

**Conectar Prometheus como data source:**
1. **Connections → Data sources → Add data source → Prometheus**
2. URL: `http://prometheus:9090` (nombre del servicio Docker, no localhost)
3. **Save & Test** — debe decir "Successfully queried the Prometheus API"

**Importar el dashboard de MySQL:**
1. **Dashboards → Import**
2. Escribe el ID `7362` → Load (MySQL Overview by Percona)
3. Selecciona el data source "Prometheus" y guarda

Verás métricas como: queries por segundo, conexiones activas, threads, InnoDB buffer pool, latencia de lectura/escritura, tablas abiertas y más.

---

## Verificación final

| Componente | Cómo verificarlo |
|-----------|-----------------|
| API Django | `curl http://TU_IP/api/auth/login/` → responde JSON |
| Frontend | Abre `https://opticode.pages.dev` en el navegador |
| Base de datos | `docker compose ps` → todos los contenedores en estado "Up" |
| Prometheus | `http://TU_IP:9090/targets` → 2 targets UP (prometheus + mysql) |
| Grafana | `http://TU_IP:3000` → login y dashboards con datos |
| mysqld_exporter | `curl http://localhost:9104/metrics` en EC2 → responde métricas |
| Swap | `free -h` en EC2 → muestra 2.0G en Swap |
| DataGrip → RDS | Conexión via SSH tunnel con `opticode-key.pem` → tablas visibles |

---

## Conectarse a RDS desde DataGrip (tu máquina local)

RDS no tiene IP pública, así que la forma correcta es usar un **SSH Tunnel** a través de la EC2. DataGrip lo soporta de forma nativa.

### Opción A — SSH Tunnel (recomendada, RDS sigue privado)

En DataGrip: **+ → Data Source → MySQL**

**Pestaña "SSH/SSL" → Use SSH tunnel:**

| Campo | Valor |
|-------|-------|
| Host | TU_IP_PUBLICA_EC2 |
| Port | 22 |
| User | ubuntu |
| Auth type | Key pair (OpenSSH) |
| Private key file | ruta a tu `opticode-key.pem` |

**Pestaña "General":**

| Campo | Valor |
|-------|-------|
| Host | TU_ENDPOINT_RDS.us-east-1.rds.amazonaws.com |
| Port | 3306 |
| User | admin |
| Password | TU_PASSWORD_RDS |
| Database | opticode |

DataGrip abre el túnel SSH automáticamente cada vez que te conectas. No necesitas cambiar nada en AWS.

### Opción B — RDS con acceso público (más simple, menos correcto)

Solo si prefieres conectarte directo sin SSH tunnel.

**En AWS Console:**
1. RDS → tu instancia → Modify
2. **Connectivity → Public access: Yes**
3. Apply immediately → Confirm

**En el Security Group de RDS (`opticode-rds-sg`), agrega:**
- Tipo: MySQL/Aurora, Puerto: 3306, Origen: **My IP**

> ⚠️ Cada vez que cambie tu IP (ej. cambias de red) debes actualizar esta regla.

**En DataGrip:** conexión MySQL normal, Host = el endpoint de RDS, sin SSH tunnel.

---

Una vez configurado todo, para subir cambios:

```bash
# Desde tu máquina local
ssh -i opticode-key.pem ubuntu@TU_IP_PUBLICA_EC2
cd /home/ubuntu/opticode
bash deploy/deploy.sh
```

---

## Costos estimados

| Servicio | Costo primer año | Costo después |
|---------|-----------------|--------------|
| EC2 t2.micro | $0 (Free Tier) | ~$8/mes |
| RDS MySQL t3.micro | $0 (Free Tier) | ~$15/mes |
| Cloudflare Pages | **$0 siempre** | $0 |
| VPC / transferencia de red | ~$0 (poco tráfico) | ~$0 |
| **Total** | **~$0** | **~$23/mes** |

> Apaga EC2 y RDS desde la consola de AWS cuando no los uses — Cloudflare Pages no genera costo aunque esté encendido siempre.
