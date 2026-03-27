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

#### 6. Aplica las migraciones

```bash
python manage.py migrate
```

#### 7. Inicia el servidor de desarrollo

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
