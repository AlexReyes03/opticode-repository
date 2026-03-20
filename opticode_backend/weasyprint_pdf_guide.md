# Guía: Exportación de PDFs en Django con WeasyPrint

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

### Ejemplo de Implementación (views.py):

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

### Plantilla de Ejemplo (`pdf/report.html`):

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
