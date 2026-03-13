# OPTICODE - Plataforma de Análisis de Métricas WCAG Para Accesibilidad Web

**Autor:** StackFlow - ACK

Plataforma de auditoría de accesibilidad WCAG que permite a los desarrolladores evaluar sus archivos HTML y CSS, obtener un puntaje por archivo y visualizar los errores con detalle de línea y contexto de código.

## Características

- Registro e inicio de sesión con JWT
- Gestión de proyectos y carga de archivos HTML/CSS (individual o por lote ZIP)
- Motor de análisis estático de reglas WCAG
- Dashboard de resultados con sistema de semáforo y puntaje por archivo (0-100)
- Detalle de errores con severidad, regla WCAG violada y fragmento de código


## BACKEND

### Tecnologías

- Python 3.13
- Django 5.2
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- django-environ
- Loguru
- MySQL

### Estructura del proyecto

```
opticode_backend/
├── config/                  # Configuración central de Django
│   ├── settings/
│   │   ├── base.py          # Settings compartidos
│   │   ├── development.py   # Settings de desarrollo (DEBUG=True)
│   │   └── logging.py       # Configuración de Loguru
│   ├── urls.py              # Rutas raíz
│   ├── asgi.py
│   └── wsgi.py
├── core/
│   └── logging.py           # Inicialización de Loguru (compartido entre features)
├── features/
│   ├── auth/                # Autenticación: registro, login, JWT, recuperación
│   ├── users/               # Administración de cuentas
│   ├── projects/            # Proyectos y carga de archivos
│   └── audit/               # Motor WCAG y resultados
├── logs/                    # Archivos de log generados en tiempo de ejecución
├── manage.py
├── requirements.txt
└── .env.example
```

### Requisitos previos

- Python 3.11 o superior
- MySQL 8.0 o superior

### Instalación paso a paso

**1. Clona el repositorio y entra a la carpeta del backend**

```bash
git clone <url-del-repo>
cd opticode-repository/opticode_backend
```

**2. Crea y activa el entorno virtual**

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

**3. Instala las dependencias**

```bash
pip install -r requirements.txt
```

**4. Crea la base de datos en MySQL**

```sql
CREATE DATABASE opticode_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**5. Configura las variables de entorno**

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
SECRET_KEY=una-clave-secreta-segura
ALLOWED_HOSTS=localhost,127.0.0.1

DJANGO_ENV=development

DB_NAME=opticode_db
DB_USER=tu-usuario-mysql
DB_PASSWORD=tu-contraseña-mysql
DB_HOST=127.0.0.1
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:5173

LOG_LEVEL=DEBUG
LOG_DIR=logs
```

**6. Aplica las migraciones**

```bash
python manage.py migrate
```

**7. Inicia el servidor de desarrollo**

```bash
python manage.py runserver
```

El servidor quedará disponible en `http://127.0.0.1:8000`.


## FRONTEND

### Tecnologías

- React
- Vite
- Bootstrap
- JavaScript

### Instalación

```bash
cd opticode_frontend
npm install
```

### Uso

```bash
npm run dev
```

El cliente quedará disponible en `http://localhost:5173`.

## Guía de Contribución

### Flujo de Trabajo (Trunk-Based Development)

Este proyecto utiliza la metodología **Trunk-Based Development**. Todas las ramas de características deben ser de corta duración y fusionarse (*merge*) directamente a la rama principal a través de Pull Requests (PRs) de manera continua y frecuente.

Para enviar un PR, siga estas directrices:
1. Asegúrese de mantener su rama local actualizada respecto a la rama principal.
2. Cree una rama efímera para su desarrollo a partir de la rama principal.
3. Verifique que sus cambios cumplan con los criterios de calidad y no introduzcan regresiones.
4. Abra el PR hacia la rama principal proporcionando una descripción clara del valor aportado o el problema resuelto.

### Convención de Commits

Para mantener el historial del proyecto limpio y automatizable, es obligatorio utilizar la siguiente nomenclatura basada en *Conventional Commits*:

| Tipo | Uso | Ejemplo |
| :--- | :--- | :--- |
| **feat** | Introducción de una nueva funcionalidad. | `feat(api): add user profile endpoint` |
| **fix** | Corrección de un error o *bug*. | `fix(ui): resolve button alignment issue` |
| **chore** | Tareas de mantenimiento, actualización de dependencias o herramientas (sin cambios en código de producción). | `chore: update dependencies` |
| **refactor** | Modificaciones en el código que no alteran el comportamiento externo ni corrigen errores, pero mejoran la estructura o limpieza. | `refactor: simplify validation logic` |
| **docs** | Modificaciones exclusivas en la documentación (README, comentarios). | `docs: update installation guide` |
| **style** | Cambios de formato (espacios, punto y coma) que no interfieren con la lógica del código. | `style: run prettier on all files` |
| **test** | Creación o modificación de pruebas unitarias/integración. | `test: add cases for edge-case login` |
| **perf** | Optimizaciones en el código para mejorar el rendimiento. | `perf: optimize database query` |
| **ci** | Cambios en la configuración de CI/CD (scripts, *pipelines* de GitHub Actions, Vercel, etc.). | `ci: add github action for linting` |
