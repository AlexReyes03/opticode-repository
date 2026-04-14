# OPTICODE - Plataforma de Análisis de Métricas WCAG Para Accesibilidad Web

**Autor:** StackFlow - ACK

Plataforma de auditoría de accesibilidad WCAG que permite a los desarrolladores evaluar sus archivos HTML y CSS, obtener un puntaje por archivo y visualizar los errores con detalle de línea y contexto de código.

## Características

- Registro e inicio de sesión con JWT
- Gestión de proyectos y carga de archivos HTML/CSS (individual o por lote ZIP)
- Motor de análisis estático de reglas WCAG
- Dashboard de resultados con sistema de semáforo y puntaje por archivo (0-100)
- Detalle de errores con severidad, regla WCAG violada y fragmento de código

## Niveles WCAG (A, AA, AAA) y la interfaz

En el cliente pueden mostrarse **tarjetas o totales** alineados con los niveles de conformidad **A**, **AA** y **AAA** de WCAG con fin **pedagógico**: ayudan a situar el resultado dentro del marco del estándar.

Eso **no equivale** a decir que “nivel WCAG = severidad del hallazgo”. Los niveles de conformidad los define el W3C con criterios propios del estándar (p. ej. aplicabilidad, testabilidad, factores para autores); la **severidad** en el informe (error, advertencia, etc.) responde a la **lógica del motor de análisis** y al impacto que se quiera priorizar. Por tanto, un criterio clasificado como **AA** en WCAG puede figurar como error en el producto si la regla lo trata así.

Documentación oficial sobre niveles de conformidad: [Understanding Conformance (W3C/WAI)](https://www.w3.org/WAI/WCAG21/Understanding/conformance#levels-of-guidance).

## BACKEND

### Tecnologías Backend

- Python 3.13
- Django 5.2
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- django-environ
- Loguru
- MySQL

### Estructura del proyecto

```text
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

#### 1. Clona el repositorio y entra a la carpeta del backend

```bash
git clone <url-del-repo>
cd opticode-repository/opticode_backend
```

#### 2. Crea y activa el entorno virtual

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

#### 3. Instala las dependencias

```bash
pip install -r requirements.txt
```

#### 4. Crea la base de datos en MySQL

```sql
CREATE DATABASE opticode_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 5. Configura las variables de entorno

Django lee **únicamente** el archivo [`opticode_backend/.env`](opticode_backend/.env) (`config/settings/base.py`). No se carga ningún `.env.development` en el backend; el modo `development` o `production` se elige con la variable `DJANGO_ENV` dentro de ese mismo `.env`.

```bash
cp .env.example .env
```

Edita `.env` con tus valores. La plantilla [`opticode_backend/.env.example`](opticode_backend/.env.example) debe contener **las mismas claves** que tu `.env` (incluidas las opcionales vacías); si falta alguna en tu copia local, añádela desde el ejemplo para evitar desalineaciones.

**Referencia de variables (detalle aquí, no en el `.env`):**

| Variable | Uso |
|----------|-----|
| `SECRET_KEY` | Clave secreta de Django. |
| `ALLOWED_HOSTS` | Hosts permitidos, separados por coma. |
| `DJANGO_ENV` | `development` o `production` (elige settings en `config/settings/__init__.py`). |
| `DB_*` | Conexión MySQL (`NAME`, `USER`, `PASSWORD`, `HOST`, `PORT`). |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend permitidos (p. ej. `http://localhost:5173`). |
| `JWT_ENABLED` | Activa o desactiva autenticación JWT (solo `False` en entornos controlados). |
| `AUTH_RSA_PRIVATE_KEY_FILE` | Opcional. Ruta a un archivo `.pem` con la clave **privada** (ruta relativa a `opticode_backend` o absoluta). Si no está vacía, **tiene prioridad** sobre `AUTH_RSA_PRIVATE_KEY`. |
| `AUTH_RSA_PRIVATE_KEY` | Opcional. PEM en **una línea** con `\n` como salto de línea (el código expande `\\n` al leer). Se ignora si `AUTH_RSA_PRIVATE_KEY_FILE` apunta a un archivo válido. Si todo queda vacío, login/registro aceptan contraseña en claro (en producción usa HTTPS). |
| `AUTH_RSA_KEY_ID` | Identificador de la clave (p. ej. `v1`); debe coincidir con lo que devuelve el endpoint de clave pública. |
| `LOG_LEVEL`, `LOG_DIR` | Configuración de Loguru. |
| `DEV_ADMIN_EMAIL`, `DEV_ADMIN_USERNAME`, `DEV_SEED_PASSWORD` | Credenciales usadas por `create_dev_superuser` y seeds (ver paso 7). |

**Cifrado RSA (opcional):** el archivo de clave puede generarse en la **raíz de `opticode_backend`** (junto a `manage.py`), con el nombre sugerido `auth_rsa.pem`. Puedes referenciarlo en `.env` con `AUTH_RSA_PRIVATE_KEY_FILE=auth_rsa.pem` sin pegar el PEM en el entorno.

1. Abre una terminal **Bash** (por ejemplo **Git Bash**), sitúate en el backend y genera la clave privada:

```bash
cd opticode-repository/opticode_backend
openssl genrsa -out auth_rsa.pem 2048
```

Ese comando **solo crea** `auth_rsa.pem` si termina bien; no imprime la clave en pantalla (es el comportamiento esperado). **No subas** el `.pem` al repositorio (figura en `.gitignore`).

2. Para poner el PEM en `.env` como **una sola línea** con la secuencia `\n` entre las líneas del PEM, en **PowerShell** (en la misma carpeta `opticode_backend` donde está `auth_rsa.pem`):

```powershell
(Get-Content -Raw auth_rsa.pem).Trim() -replace "`r?`n", '\n' | Set-Clipboard
```

Abre `opticode_backend/.env` y asigna:

```env
AUTH_RSA_PRIVATE_KEY=<pegar el contenido del portapapeles>
```

3. **Alternativa en Bash** (imprime la línea lista para copiar):

```bash
awk 'NF {sub(/\r$/,""); printf "%s\\n",$0;}' auth_rsa.pem
```

#### Cifrado de credenciales (RSA-OAEP SHA-256)

Si hay clave privada configurada (`AUTH_RSA_PRIVATE_KEY_FILE` o `AUTH_RSA_PRIVATE_KEY`), el cliente puede cifrar datos sensibles antes del `POST` sin compartir nunca la clave **privada**: solo el servidor puede descifrar.

**¿Por qué aparece primero un `GET /api/auth/crypto/public-key/` al iniciar sesión o registrarse?** El navegador necesita la **clave pública** (derivada de la privada en el servidor) para cifrar con **RSA-OAEP** y **SHA-256** (Web Crypto API). Esa respuesta **no se guarda en disco en el servidor** para ese endpoint: se calcula al vuelo y se envía al cliente. En el frontend la respuesta se **cachea unos minutos** en memoria para no pedirla en cada pulsación.

**¿Dónde “vive” la clave pública?** No se almacena en una tabla de base de datos: se expone solo por HTTP. La clave privada permanece en el `.env` del backend (o en el material que uses en producción).

**Flujo resumido:** el cliente pide la clave pública → cifra en el navegador cada campo acordado (correo y contraseña en login y registro; las tres contraseñas en “Cambiar contraseña”) → envía **solo** `*_cipher` en Base64 más `key_id` → el backend descifra en memoria con `cryptography` → valida o autentica y, en el caso de contraseñas, Django las guarda como **hash** (`set_password` / `create_user`), no en texto plano en la base de datos.

**Límite de tamaño:** con RSA 2048 bits y OAEP-SHA256, cada valor cifrado por separado admite como mucho unos **190 bytes en UTF-8** por campo. Correos y contraseñas habituales entran; textos muy largos fallarían (en ese caso habría que plantear otro esquema, p. ej. híbrido AES+RSA).

Si no hay clave privada (archivo y PEM en línea vacíos), el mismo código envía correo y contraseña en claro (solo aceptable con **HTTPS** en producción).

#### 6. Aplica las migraciones

```bash
python manage.py migrate
```

#### 7. Superusuario de desarrollo

Para acceder al panel de administración de Django (`/admin/`), crea el superusuario de desarrollo desde la carpeta `opticode_backend` con el entorno virtual activado:

```bash
python manage.py create_dev_superuser
```

En Windows, si usas el lanzador de Python, puedes sustituir `python` por `py` (por ejemplo `py manage.py create_dev_superuser`).

Las variables `DEV_ADMIN_EMAIL`, `DEV_ADMIN_USERNAME` y `DEV_SEED_PASSWORD` deben estar definidas en el mismo `opticode_backend/.env` (ya figuran en `.env.example`). Los valores son los tuyos; el siguiente bloque es solo ilustrativo.

```env
DEV_ADMIN_EMAIL=correo@ejemplo.com
DEV_ADMIN_USERNAME=usuario-ejemplo
DEV_SEED_PASSWORD=ContraseñaDeEjemploSegura123!
```

La contraseña del superusuario y de las semillas usa **`DEV_SEED_PASSWORD`** (no existe `DEV_ADMIN_PASSWORD` en este proyecto).

Si el comando falla con `Table '…auditlog_auditlog' doesn't exist`, la base de datos **no tiene aplicadas todas las migraciones** (incluida la app interna `auditlog`). Ejecuta de nuevo `python manage.py migrate` desde `opticode_backend` usando el mismo `.env` (misma `DB_NAME` y credenciales) y repite `create_dev_superuser`.

En Windows, el lanzador `py` solo existe si lo instalaste con Python; si `py` no se reconoce, usa `python manage.py …` o instala/repara el *Python Launcher for Windows* desde el instalador oficial.

#### 8. Datos de prueba

Para cargar datos de desarrollo en la base de datos:

```bash
python manage.py seed_data
python manage.py seed_realistic
```

Ejecútalos en ese orden si quieres primero datos mínimos y después un conjunto más completo (según lo definido en cada comando).

#### 9. Inicia el servidor de desarrollo

```bash
python manage.py runserver
```

El servidor quedará disponible en `http://127.0.0.1:8000`.

## FRONTEND

### Tecnologías Frontend

- React
- Vite
- Bootstrap
- JavaScript

### Instalación

```bash
cd opticode_frontend
npm install
```

Variables de entorno (opcional): copia [`opticode_frontend/.env.example`](opticode_frontend/.env.example) a `.env` (o a `.env.development` si prefieres el modo *development* de Vite). Las explicaciones están en esta sección, no en el archivo de ejemplo.

**`VITE_API_URL`:** vacío → las peticiones van a rutas relativas `/api/...` en el mismo origen que Vite (`http://localhost:5173`) y el proxy de [`vite.config.js`](opticode_frontend/vite.config.js) las reenvía a `http://localhost:8000`. Si pones la URL completa del API (p. ej. `http://127.0.0.1:8000`), el navegador llama directo al backend y debe coincidir con `CORS_ALLOWED_ORIGINS` en Django.

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

Para mantener el historial del proyecto limpio y automatizable, es obligatorio utilizar la siguiente nomenclatura basada en Conventional Commits:

| Tipo | Uso | Ejemplo |
| :--- | :--- | :--- |
| **FEAT** | Introducción de una nueva funcionalidad. | `[FEAT] agregar endpoint de perfil de usuario` |
| **FIX** | Corrección de un error o *bug*. | `[FIX] corregir alineación de botón` |
| **CHORE** | Tareas de mantenimiento, actualización de dependencias o herramientas (sin cambios en código de producción). | `[CHORE] actualizar dependencias` |
| **REFACTOR** | Modificaciones en el código que no alteran el comportamiento externo ni corrigen errores, pero mejoran la estructura o limpieza. | `[REFACTOR] simplificar lógica de validación` |
| **DOCS** | Modificaciones exclusivas en la documentación (README, comentarios). | `[DOCS] actualizar guía de instalación` |
| **STYLE** | Cambios de formato (espacios, punto y coma) que no interfieren con la lógica del código. | `[STYLE] ejecutar prettier en todo el proyecto` |
| **TEST** | Creación o modificación de pruebas unitarias/integración. | `[TEST] agregar casos para login de borde` |
| **PERF** | Optimizaciones en el código para mejorar el rendimiento. | `[PERF] optimizar consulta a base de datos` |
| **CI** | Cambios en la configuración de CI/CD (scripts, *pipelines* de GitHub Actions, Vercel, etc.). | `[CI] agregar acción de GitHub para linting` |

## Guía: Exportación de PDFs en Django con WeasyPrint

WeasyPrint es una herramienta visual para generar PDFs a partir de plantillas HTML y CSS. Es ideal para integrarse con Django porque nos permite reutilizar el sistema de plantillas (`render_to_string`) y aplicar estilos CSS modernos para generar documentos bien formateados (como reportes, facturas o recibos).

## 1. Dependencias del Sistema (IMPORTANTE)

WeasyPrint requiere bibliotecas de sistema C subyacentes encargadas del renderizado de gráficos y texto.

**En Linux (Ubuntu/Debian):**

```bash
sudo apt-get install build-essential python3-dev python3-pip python3-setuptools python3-wheel python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
```

**En Windows:**

WeasyPrint depende de **[GTK3](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer)**, que incluye `cairo` y `pango`.

1. Descarga el instalador del runtime de GTK3 para Windows.
2. Instálalo y asegúrate de marcar la opción para agregar GTK al `PATH` del sistema.
3. Reinicia tu terminal/IDE para que tome los cambios en el entorno.

**En macOS:**

```bash
brew install cairo pango gdk-pixbuf libffi
```

## 2. Instalación en el Proyecto

Añade WeasyPrint a tu entorno virtual:

```bash
pip install weasyprint
```

*(No olvides agregarlo a tu `requirements.txt`)*.

---

## 3. Generar un PDF desde una Vista en Django

El flujo básico en Django consiste en:

1. Obtener los datos del contexto.
2. Renderizar el HTML utilizando `render_to_string` pasándole el contexto.
3. Pasar el HTML plano a WeasyPrint.
4. Retornar la respuesta HTTP configurando el `Content-Type` como PDF.

### Ejemplo de implementación (`views.py`)

```python
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
import tempfile

def export_project_pdf(request, project_id):
    # 1. Obtener la data
    context = {
        'project_id': project_id,
        'title': 'Reporte del Proyecto',
        'details': 'Estos son los detalles del proyecto a exportar...'
    }

    # 2. Renderizar la plantilla HTML a un string
    # Nota: Asegúrate de tener una plantilla en 'templates/pdf/report.html'
    html_string = render_to_string('pdf/report.html', context)

    # 3. Construir el PDF
    # Se genera un objeto HTML de WeasyPrint
    html = HTML(string=html_string, base_url=request.build_absolute_uri())
    
    # 4. Generar el PDF en memoria y retornarlo
    result = html.write_pdf()
    
    # Preparar el Response
    response = HttpResponse(result, content_type='application/pdf')
    # attachment; filename=... fuerza la descarga
    # inline; filename=... abre el PDF en el navegador
    response['Content-Disposition'] = f'inline; filename="proyecto_{project_id}.pdf"'
    
    return response
```

### Plantilla de ejemplo (`pdf/report.html`)

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
    <style>
        /* Estilos específicos para impresión */
        @page {
            size: A4;
            margin: 2cm;
            @bottom-right {
                content: "Página " counter(page) " de " counter(pages);
            }
        }
        body {
            font-family: 'Helvetica', sans-serif;
            color: #333;
        }
        h1 {
            color: #0056b3;
            border-bottom: 2px solid #0056b3;
            padding-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1>{{ title }}</h1>
    <p>Proyecto ID: {{ project_id }}</p>
    <div class="content">
        <p>{{ details }}</p>
    </div>
</body>
</html>
```

---

## 4. Notas Adicionales

- **Archivos Estáticos (`base_url`):** Cuando el HTML requiere cargar imágenes estáticas o CSS externo (ej: `{% static 'css/style.css' %}`), es OBLIGATORIO pasar el parámetro `base_url=request.build_absolute_uri()` a `HTML()` para que WeasyPrint pueda resolver las rutas absolutas correctamente.
- **Rendimiento:** Generar PDFs puede ser un proceso bloqueante pesado. Para documentos muy grandes, considera usar Celery para generarlo en background y luego notificar al usuario.
