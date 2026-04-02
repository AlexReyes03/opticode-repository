import os

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

import environ

from features.audit.models import AuditResult, Finding, UploadedFile
from features.auth.models import User
from features.projects.models import Project

env = environ.Env()


# ── Contenido HTML/CSS realista ──────────────────────────────────────────

HTML_INDEX = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal Ciudadano - Gobierno Municipal</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header role="banner">
        <nav aria-label="Navegacion principal">
            <ul>
                <li><a href="index.html">Inicio</a></li>
                <li><a href="tramites.html">Tramites</a></li>
                <li><a href="contacto.html">Contacto</a></li>
            </ul>
        </nav>
        <h1>Portal Ciudadano</h1>
    </header>
    <main role="main">
        <section aria-labelledby="bienvenida">
            <h2 id="bienvenida">Bienvenido al portal de servicios</h2>
            <p>Realiza tus tramites en linea de manera segura.</p>
        </section>
    </main>
    <footer role="contentinfo">
        <p>&copy; 2026 Gobierno Municipal</p>
    </footer>
</body>
</html>"""

HTML_FORM_BAD = """<!DOCTYPE html>
<html>
<head><title>Formulario</title></head>
<body>
    <h1>Registro</h1>
    <form>
        <input type="text" placeholder="Nombre">
        <input type="email" placeholder="Correo">
        <input type="password">
        <select>
            <option value="">Selecciona</option>
            <option value="1">Opcion 1</option>
        </select>
        <button onclick="enviar()">Enviar</button>
    </form>
    <img src="banner.jpg">
    <div onclick="abrir()" style="color: #aaa; background: #fff;">
        Click aqui para mas info
    </div>
</body>
</html>"""

HTML_TABLE = """<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Reporte Trimestral</title></head>
<body>
    <h1>Reporte de Gastos Q1 2026</h1>
    <table>
        <tr><td>Concepto</td><td>Monto</td><td>Fecha</td></tr>
        <tr><td>Papeleria</td><td>$15,000</td><td>2026-01-15</td></tr>
        <tr><td>Infraestructura</td><td>$280,000</td><td>2026-02-01</td></tr>
        <tr><td>Capacitacion</td><td>$45,000</td><td>2026-03-10</td></tr>
    </table>
    <img src="chart.png">
</body>
</html>"""

HTML_ECOMMERCE_PRODUCT = """<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Laptop Pro X1 - TechStore</title></head>
<body>
    <nav aria-label="Breadcrumb">
        <ol><li><a href="/">Inicio</a></li><li>Laptops</li><li>Pro X1</li></ol>
    </nav>
    <main>
        <article>
            <h1>Laptop Pro X1 Carbon</h1>
            <img src="laptop-pro.jpg" alt="Laptop Pro X1 Carbon color negro, vista frontal">
            <p>Procesador Intel i7, 16GB RAM, SSD 512GB.</p>
            <p aria-live="polite">Precio: <strong>$24,999.00</strong></p>
            <label for="qty">Cantidad:</label>
            <input type="number" id="qty" min="1" value="1">
            <button type="submit">Agregar al carrito</button>
        </article>
    </main>
</body>
</html>"""

HTML_CART_BAD = """<!DOCTYPE html>
<html>
<head><title>Carrito</title></head>
<body>
    <div class="cart">
        <h2>Tu carrito</h2>
        <div class="item">
            <img src="prod1.jpg">
            <span>Laptop Pro</span>
            <span>$24,999</span>
            <div onclick="removeItem(1)" style="cursor:pointer">X</div>
        </div>
        <div class="item">
            <img src="prod2.jpg">
            <span>Mouse Wireless</span>
            <span>$599</span>
            <div onclick="removeItem(2)" style="cursor:pointer">X</div>
        </div>
        <div class="total">Total: $25,598</div>
        <div onclick="checkout()" class="btn">Pagar ahora</div>
    </div>
</body>
</html>"""

HTML_LOGIN = """<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Iniciar Sesion - EduPlat</title></head>
<body>
    <main>
        <h1>Iniciar Sesion</h1>
        <form action="/login" method="POST">
            <label for="email">Correo electronico</label>
            <input type="email" id="email" name="email" required autocomplete="email">
            <label for="pass">Contrasena</label>
            <input type="password" id="pass" name="password" required>
            <button type="submit">Ingresar</button>
        </form>
        <p>No tienes cuenta? <a href="/registro">Registrate aqui</a></p>
    </main>
</body>
</html>"""

HTML_DASHBOARD_BAD = """<!DOCTYPE html>
<html>
<head><title>Dashboard</title></head>
<body>
    <div class="sidebar">
        <div onclick="navigate('home')">Inicio</div>
        <div onclick="navigate('courses')">Cursos</div>
        <div onclick="navigate('grades')">Calificaciones</div>
        <div onclick="navigate('profile')">Perfil</div>
    </div>
    <div class="content">
        <div class="card">
            <img src="math-icon.png">
            <b>Matematicas Avanzadas</b>
            <span style="color: #999; background: #f5f5f5;">Progreso: 75%</span>
        </div>
        <div class="card">
            <img src="science-icon.png">
            <b>Fisica Cuantica</b>
            <span style="color: #bbb;">Progreso: 40%</span>
        </div>
    </div>
    <div id="notification" style="display:none">Tienes 3 tareas pendientes</div>
</body>
</html>"""

HTML_ARTICLE = """<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Educacion Inclusiva - Blog EduPlat</title></head>
<body>
    <article>
        <header>
            <h1>Como implementar educacion inclusiva en el aula digital</h1>
            <p>Por <a href="/autores/dra-lopez">Dra. Maria Lopez</a> | 15 de marzo, 2026</p>
        </header>
        <section>
            <h2>Principios fundamentales</h2>
            <p>La educacion inclusiva busca garantizar que todos los estudiantes,
               independientemente de sus capacidades, tengan acceso al aprendizaje.</p>
            <blockquote cite="https://www.unesco.org">
                <p>La inclusion no es una estrategia para ayudar a las personas a encajar
                   en sistemas existentes. Es transformar esos sistemas.</p>
            </blockquote>
        </section>
        <section>
            <h2>Herramientas recomendadas</h2>
            <ul>
                <li>Lectores de pantalla compatibles</li>
                <li>Subtitulos en contenido multimedia</li>
                <li>Navegacion por teclado</li>
            </ul>
            <img src="inclusive-classroom.jpg" alt="Aula con estudiantes usando tecnologia asistiva">
        </section>
    </article>
</body>
</html>"""

CSS_GOOD = """/* Variables del sistema de diseno */
:root {
    --color-primary: #1a5276;
    --color-secondary: #2e86c1;
    --color-text: #2c3e50;
    --color-bg: #ffffff;
    --color-error: #c0392b;
    --color-success: #27ae60;
    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    --font-size-base: 16px;
    --line-height: 1.6;
}

body {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: var(--line-height);
    color: var(--color-text);
    background-color: var(--color-bg);
    margin: 0;
    padding: 0;
}

/* Contraste AAA: #2c3e50 sobre #ffffff = 10.7:1 */
h1, h2, h3 { color: var(--color-primary); }

a {
    color: var(--color-secondary);
    text-decoration: underline;
}

a:focus {
    outline: 3px solid var(--color-secondary);
    outline-offset: 2px;
}

/* Skip link para navegacion por teclado */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px;
    background: var(--color-primary);
    color: #ffffff;
    z-index: 1000;
}
.skip-link:focus { top: 0; }

button, .btn {
    padding: 12px 24px;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: var(--color-primary);
    color: #ffffff; /* Contraste: #ffffff sobre #1a5276 = 8.9:1 */
}"""

CSS_BAD = """body {
    font-family: Arial;
    font-size: 12px;
    color: #999999;
    background: #ffffff;
}

/* Contraste FALLA: #999999 sobre #ffffff = 2.85:1 (minimo AA es 4.5:1) */
.subtitle { color: #aaaaaa; }

/* Contraste FALLA: #cccccc sobre #f0f0f0 = 1.47:1 */
.muted-text { color: #cccccc; background: #f0f0f0; }

a { color: #88bbdd; text-decoration: none; }

/* Font size menor a 14px sin compensacion */
.small-text { font-size: 10px; color: #bbbbbb; }

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    /* Sin focus visible */
}

/* Animacion sin prefers-reduced-motion */
.fancy-animation {
    animation: slide 0.5s infinite;
}"""

CSS_MIXED = """/* Tema oscuro de la plataforma educativa */
:root {
    --bg-dark: #1e1e2e;
    --text-light: #cdd6f4;
    --accent: #89b4fa;
    --surface: #313244;
}

body {
    background: var(--bg-dark);
    color: var(--text-light); /* Contraste: #cdd6f4 sobre #1e1e2e = 11.2:1 OK */
    font-size: 16px;
    line-height: 1.5;
}

/* Contraste OK: #89b4fa sobre #1e1e2e = 7.1:1 */
a { color: var(--accent); }

/* Contraste FALLA: #585b70 sobre #1e1e2e = 2.4:1 */
.disabled-text { color: #585b70; }

.card {
    background: var(--surface);
    border-radius: 8px;
    padding: 16px;
}

/* Falta focus visible en interactivos */
.nav-item { cursor: pointer; padding: 8px 16px; }
.nav-item:hover { background: #45475a; }"""


class Command(BaseCommand):
    help = "Carga datos realistas: 8 usuarios (2 admin), 5 proyectos, 20+ archivos, hallazgos WCAG detallados"

    def handle(self, *args, **options):
        if User.objects.filter(email="realistic_seed@opticode.com").exists():
            self.stdout.write(self.style.WARNING("Los datos realistas ya existen."))
            return

        self.stdout.write("Creando datos realistas...")
        password = env("DEV_SEED_PASSWORD", default="Admin123!")

        # ── Usuarios (8 total, 2 admin) ─────────────────
        admin1 = User.objects.create_user(
            username="carlos_lead", email="realistic_seed@opticode.com",
            password=password, first_name="Carlos", last_name="Mendoza", is_staff=True,
        )
        admin2 = User.objects.create_user(
            username="diana_qa", email="diana.qa@stackflow.com",
            password=password, first_name="Diana", last_name="Rojas", is_staff=True,
        )
        u1 = User.objects.create_user(
            username="alejandro_front", email="alejandro.dev@stackflow.com",
            password=password, first_name="Alejandro", last_name="Reyes",
        )
        u2 = User.objects.create_user(
            username="sofia_back", email="sofia.dev@stackflow.com",
            password=password, first_name="Sofia", last_name="Torres",
        )
        u3 = User.objects.create_user(
            username="miguel_fullstack", email="miguel.dev@stackflow.com",
            password=password, first_name="Miguel", last_name="Hernandez",
        )
        u4 = User.objects.create_user(
            username="valentina_ux", email="valentina.ux@stackflow.com",
            password=password, first_name="Valentina", last_name="Castillo",
        )
        u5 = User.objects.create_user(
            username="roberto_pm", email="roberto.pm@stackflow.com",
            password=password, first_name="Roberto", last_name="Vega",
        )
        u6 = User.objects.create_user(
            username="camila_intern", email="camila.intern@stackflow.com",
            password=password, first_name="Camila", last_name="Flores",
        )
        self.stdout.write(self.style.SUCCESS("  [OK] 8 usuarios creados (2 admin)"))

        # ── Proyectos (5) ───────────────────────────────
        p1 = Project.objects.create(
            name="Portal Ciudadano Gobierno Municipal",
            description="Sitio web del gobierno municipal para tramites ciudadanos. Requiere WCAG 2.1 nivel AA por normativa federal.",
            owner=admin1,
        )
        p2 = Project.objects.create(
            name="TechStore E-commerce",
            description="Tienda en linea de tecnologia. Objetivo: cumplir WCAG 2.1 AA para ampliar mercado a usuarios con discapacidad.",
            owner=u1,
        )
        p3 = Project.objects.create(
            name="EduPlat - Plataforma Educativa",
            description="LMS para universidades. Requiere accesibilidad WCAG AAA por politica institucional de educacion inclusiva.",
            owner=u3,
        )
        p4 = Project.objects.create(
            name="ClinicaSalud Portal Pacientes",
            description="Portal de citas medicas y resultados de laboratorio. Normativa de salud exige accesibilidad AA.",
            owner=u2,
        )
        p5 = Project.objects.create(
            name="Banco Digital App Web",
            description="Aplicacion bancaria web. Regulacion financiera requiere WCAG 2.1 AA en todos los flujos criticos.",
            owner=u4,
        )
        self.stdout.write(self.style.SUCCESS("  [OK] 5 proyectos creados"))

        # ── Archivos y estructura ───────────────────────
        uploads_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        files_config = [
            # Proyecto 1: Portal Gobierno
            (p1, "index.html", "html", HTML_INDEX, 95.0),
            (p1, "formulario-tramite.html", "html", HTML_FORM_BAD, 25.0),
            (p1, "reporte-gastos.html", "html", HTML_TABLE, 55.0),
            (p1, "estilos-portal.css", "css", CSS_GOOD, 100.0),
            (p1, "print-styles.css", "css", CSS_BAD, 30.0),
            # Proyecto 2: E-commerce
            (p2, "producto-detalle.html", "html", HTML_ECOMMERCE_PRODUCT, 90.0),
            (p2, "carrito-compras.html", "html", HTML_CART_BAD, 20.0),
            (p2, "tema-tienda.css", "css", CSS_MIXED, 60.0),
            # Proyecto 3: EduPlat
            (p3, "login.html", "html", HTML_LOGIN, 95.0),
            (p3, "dashboard-estudiante.html", "html", HTML_DASHBOARD_BAD, 15.0),
            (p3, "articulo-blog.html", "html", HTML_ARTICLE, 100.0),
            (p3, "tema-oscuro.css", "css", CSS_MIXED, 60.0),
            (p3, "componentes.css", "css", CSS_GOOD, 100.0),
            # Proyecto 4: Clinica
            (p4, "citas-medicas.html", "html", HTML_FORM_BAD, 25.0),
            (p4, "resultados-lab.html", "html", HTML_TABLE, 55.0),
            (p4, "estilos-clinica.css", "css", CSS_BAD, 30.0),
            # Proyecto 5: Banco
            (p5, "transferencia.html", "html", HTML_FORM_BAD, 25.0),
            (p5, "estado-cuenta.html", "html", HTML_TABLE, 55.0),
            (p5, "login-banco.html", "html", HTML_LOGIN, 95.0),
            (p5, "tema-banco.css", "css", CSS_GOOD, 100.0),
        ]

        uploaded = []
        for project, fname, ftype, content, score in files_config:
            uf = UploadedFile(
                project=project, filename=fname, file_type=ftype,
                size_bytes=len(content.encode("utf-8")), score=score,
            )
            uf.file.save(fname, ContentFile(content.encode("utf-8")), save=True)
            uploaded.append(uf)

        self.stdout.write(self.style.SUCCESS(f"  [OK] {len(uploaded)} archivos creados"))

        # ── Hallazgos WCAG detallados por archivo ───────
        findings_map = {
            "formulario-tramite.html": [
                ("error", "WCAG 1.1.1", "Imagen sin atributo alt", 14, "<img src=\"banner.jpg\">", "img"),
                ("error", "WCAG 1.3.1", "Input sin label asociado: campo nombre", 7, "<input type=\"text\" placeholder=\"Nombre\">", "input[type=text]"),
                ("error", "WCAG 1.3.1", "Input sin label asociado: campo correo", 8, "<input type=\"email\" placeholder=\"Correo\">", "input[type=email]"),
                ("error", "WCAG 1.3.1", "Input sin label asociado: campo password", 9, "<input type=\"password\">", "input[type=password]"),
                ("error", "WCAG 2.1.1", "Elemento div con onclick no es accesible por teclado", 15, "<div onclick=\"abrir()\">", "div"),
                ("error", "WCAG 3.1.1", "Falta atributo lang en elemento html", 2, "<html>", "html"),
                ("warning", "WCAG 1.4.3", "Contraste insuficiente: #aaa sobre #fff = 2.32:1", 15, "style=\"color: #aaa; background: #fff;\"", "div"),
                ("warning", "WCAG 4.1.2", "Select sin label asociado", 10, "<select>", "select"),
            ],
            "reporte-gastos.html": [
                ("error", "WCAG 1.1.1", "Imagen chart.png sin atributo alt", 11, "<img src=\"chart.png\">", "img"),
                ("error", "WCAG 1.3.1", "Tabla sin elementos th para encabezados", 6, "<tr><td>Concepto</td>...", "table"),
                ("warning", "WCAG 1.3.1", "Tabla sin caption o aria-label descriptivo", 5, "<table>", "table"),
            ],
            "carrito-compras.html": [
                ("error", "WCAG 1.1.1", "Imagen prod1.jpg sin atributo alt", 9, "<img src=\"prod1.jpg\">", "img"),
                ("error", "WCAG 1.1.1", "Imagen prod2.jpg sin atributo alt", 14, "<img src=\"prod2.jpg\">", "img"),
                ("error", "WCAG 2.1.1", "Div con onclick no accesible: boton eliminar producto 1", 12, "<div onclick=\"removeItem(1)\">", "div"),
                ("error", "WCAG 2.1.1", "Div con onclick no accesible: boton eliminar producto 2", 17, "<div onclick=\"removeItem(2)\">", "div"),
                ("error", "WCAG 2.1.1", "Div con onclick como boton de pago no accesible por teclado", 20, "<div onclick=\"checkout()\">", "div"),
                ("error", "WCAG 3.1.1", "Falta atributo lang en elemento html", 2, "<html>", "html"),
                ("error", "WCAG 4.1.2", "Elemento interactivo sin rol ARIA: boton eliminar", 12, "<div onclick=\"removeItem(1)\">X</div>", "div"),
                ("warning", "WCAG 4.1.2", "Boton de pago deberia ser <button> en lugar de <div>", 20, "<div onclick=\"checkout()\">Pagar</div>", "div"),
            ],
            "dashboard-estudiante.html": [
                ("error", "WCAG 1.1.1", "Imagen math-icon.png sin atributo alt", 12, "<img src=\"math-icon.png\">", "img"),
                ("error", "WCAG 1.1.1", "Imagen science-icon.png sin atributo alt", 17, "<img src=\"science-icon.png\">", "img"),
                ("error", "WCAG 2.1.1", "Navegacion con divs onclick no accesible por teclado", 4, "<div onclick=\"navigate('home')\">", "div.sidebar"),
                ("error", "WCAG 3.1.1", "Falta atributo lang en elemento html", 2, "<html>", "html"),
                ("error", "WCAG 4.1.2", "Items de navegacion sin rol adecuado", 4, "<div onclick=\"navigate()\">", "div"),
                ("warning", "WCAG 1.4.3", "Contraste insuficiente: #999 sobre #f5f5f5 = 2.58:1", 14, "style=\"color: #999; background: #f5f5f5;\"", "span"),
                ("warning", "WCAG 1.4.3", "Contraste insuficiente: #bbb sobre fondo heredado", 19, "style=\"color: #bbb;\"", "span"),
                ("warning", "WCAG 4.1.3", "Notificacion oculta sin mecanismo accesible", 21, "<div id=\"notification\" style=\"display:none\">", "div#notification"),
            ],
            "print-styles.css": [
                ("error", "WCAG 1.4.3", "Contraste insuficiente: #999999 sobre #ffffff = 2.85:1", 4, "color: #999999; background: #ffffff;", "body"),
                ("error", "WCAG 1.4.3", "Contraste insuficiente: #aaaaaa sobre fondo blanco = 2.32:1", 8, "color: #aaaaaa;", ".subtitle"),
                ("error", "WCAG 1.4.3", "Contraste insuficiente: #cccccc sobre #f0f0f0 = 1.47:1", 11, "color: #cccccc; background: #f0f0f0;", ".muted-text"),
                ("warning", "WCAG 1.4.12", "Font-size de 10px puede dificultar la lectura", 16, "font-size: 10px;", ".small-text"),
                ("warning", "WCAG 2.3.3", "Animacion infinita sin respetar prefers-reduced-motion", 24, "animation: slide 0.5s infinite;", ".fancy-animation"),
            ],
            "tema-tienda.css": [
                ("error", "WCAG 1.4.3", "Contraste insuficiente: #585b70 sobre #1e1e2e = 2.4:1", 18, "color: #585b70;", ".disabled-text"),
                ("warning", "WCAG 2.4.7", "Elemento interactivo .nav-item sin estilos de focus visible", 22, ".nav-item { cursor: pointer; }", ".nav-item"),
            ],
            "tema-oscuro.css": [
                ("error", "WCAG 1.4.3", "Contraste insuficiente: #585b70 sobre #1e1e2e = 2.4:1", 18, "color: #585b70;", ".disabled-text"),
                ("warning", "WCAG 2.4.7", "Elemento interactivo .nav-item sin estilos de focus visible", 22, ".nav-item { cursor: pointer; }", ".nav-item"),
            ],
            "citas-medicas.html": [
                ("error", "WCAG 1.1.1", "Imagen sin atributo alt", 14, "<img src=\"banner.jpg\">", "img"),
                ("error", "WCAG 1.3.1", "Inputs de formulario sin labels asociados", 7, "<input type=\"text\">", "input"),
                ("error", "WCAG 3.1.1", "Falta atributo lang en elemento html", 2, "<html>", "html"),
                ("error", "WCAG 2.1.1", "Div con onclick no accesible por teclado", 15, "<div onclick=\"abrir()\">", "div"),
                ("warning", "WCAG 1.4.3", "Contraste insuficiente en elemento informativo", 15, "color: #aaa", "div"),
            ],
            "resultados-lab.html": [
                ("error", "WCAG 1.1.1", "Imagen de graficas sin texto alternativo", 11, "<img src=\"chart.png\">", "img"),
                ("error", "WCAG 1.3.1", "Tabla de resultados sin encabezados th", 6, "<table>", "table"),
            ],
            "estilos-clinica.css": [
                ("error", "WCAG 1.4.3", "Contraste insuficiente en texto principal: 2.85:1", 4, "color: #999999;", "body"),
                ("error", "WCAG 1.4.3", "Contraste insuficiente en subtitulos: 2.32:1", 8, "color: #aaaaaa;", ".subtitle"),
                ("warning", "WCAG 1.4.12", "Font-size de 10px dificulta lectura", 16, "font-size: 10px;", ".small-text"),
            ],
            "transferencia.html": [
                ("error", "WCAG 1.3.1", "Campo de monto sin label accesible", 7, "<input type=\"text\">", "input"),
                ("error", "WCAG 1.3.1", "Campo de cuenta destino sin label", 8, "<input type=\"text\">", "input"),
                ("error", "WCAG 3.1.1", "Falta atributo lang", 2, "<html>", "html"),
                ("error", "WCAG 2.1.1", "Boton critico de transferencia no accesible por teclado", 15, "<div onclick>", "div"),
                ("warning", "WCAG 1.4.3", "Contraste insuficiente en informacion de cuenta", 15, "color: #aaa", "div"),
            ],
            "estado-cuenta.html": [
                ("error", "WCAG 1.1.1", "Grafica de movimientos sin alt", 11, "<img src=\"chart.png\">", "img"),
                ("error", "WCAG 1.3.1", "Tabla de movimientos sin th", 6, "<table>", "table"),
                ("warning", "WCAG 1.3.1", "Tabla sin descripcion accesible", 5, "<table>", "table"),
            ],
        }

        for uf in uploaded:
            has_findings = uf.filename in findings_map
            has_errors = has_findings and any(
                f[0] == "error" for f in findings_map.get(uf.filename, [])
            )
            report_status = "Fallas" if has_errors else "Aprobado"

            report = AuditResult.objects.create(
                uploaded_file=uf,
                status=report_status,
            )

            if has_findings:
                Finding.objects.bulk_create([
                    Finding(
                        audit_result=report,
                        severity=sev, wcag_rule=rule, message=msg,
                        line_number=line, code_snippet=snippet,
                        affected_element=element,
                    )
                    for sev, rule, msg, line, snippet, element in findings_map[uf.filename]
                ])

        total_findings = Finding.objects.filter(
            audit_result__uploaded_file__in=uploaded
        ).count()

        self.stdout.write(self.style.SUCCESS(f"  [OK] {len(uploaded)} reportes creados"))
        self.stdout.write(self.style.SUCCESS(f"  [OK] {total_findings} hallazgos WCAG creados"))
        self.stdout.write(self.style.SUCCESS("\nDatos realistas cargados exitosamente!"))
        self.stdout.write(
            "\n  Credenciales:\n"
            "  ------------------------\n"
            f"  Password universal: {password}\n"
            "  Admins: realistic_seed@opticode.com\n"
            "          diana.qa@stackflow.com\n"
            "  Devs:   alejandro.dev@stackflow.com\n"
            "          sofia.dev@stackflow.com\n"
            "          miguel.dev@stackflow.com\n"
            "          valentina.ux@stackflow.com\n"
            "          roberto.pm@stackflow.com\n"
            "          camila.intern@stackflow.com\n"
        )
