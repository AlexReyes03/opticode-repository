import os

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

import environ

from features.audit.models import AuditResult, Finding, UploadedFile
from features.auth.models import User
from features.projects.models import Project

env = environ.Env()


class Command(BaseCommand):
    help = "Carga datos de prueba: 5 usuarios (1 admin), 3 proyectos, 10+ archivos con scores variados"

    def handle(self, *args, **options):
        if User.objects.filter(email="dev1@opticode.com").exists():
            self.stdout.write(self.style.WARNING("Los datos de prueba ya existen."))
            return

        self.stdout.write("Creando datos de prueba...")
        password = env("DEV_SEED_PASSWORD", default="Admin123!")

        # ── Usuarios (5 total, 1 admin) ─────────────────
        admin = User.objects.create_user(
            username="admin_test",
            email="dev1@opticode.com",
            password=password,
            first_name="Carlos",
            last_name="Admin",
            is_staff=True,
        )
        user2 = User.objects.create_user(
            username="maria_dev",
            email="dev2@opticode.com",
            password=password,
            first_name="María",
            last_name="López",
        )
        user3 = User.objects.create_user(
            username="juan_qa",
            email="dev3@opticode.com",
            password=password,
            first_name="Juan",
            last_name="García",
        )
        user4 = User.objects.create_user(
            username="ana_front",
            email="dev4@opticode.com",
            password=password,
            first_name="Ana",
            last_name="Martínez",
        )
        User.objects.create_user(
            username="pedro_back",
            email="dev5@opticode.com",
            password=password,
            first_name="Pedro",
            last_name="Ramírez",
        )
        self.stdout.write(self.style.SUCCESS("  [OK] 5 usuarios creados (1 admin)"))

        # ── Proyectos (3) ───────────────────────────────
        proj1 = Project.objects.create(
            name="Portal Gobierno",
            description="Sitio web del portal gubernamental para validación WCAG AA",
            owner=admin,
        )
        proj2 = Project.objects.create(
            name="E-commerce Accesible",
            description="Tienda en línea con estándares de accesibilidad",
            owner=user2,
        )
        proj3 = Project.objects.create(
            name="Blog Educativo",
            description="Plataforma educativa con contenido accesible",
            owner=user3,
        )
        self.stdout.write(self.style.SUCCESS("  [OK] 3 proyectos creados"))

        # ── Archivos (12) con scores variados ───────────
        files_data = [
            # Proyecto 1 — Portal Gobierno
            (proj1, "index.html", "html", "<html><head><title>Portal</title></head><body><h1>Inicio</h1></body></html>", 100.0),
            (proj1, "contacto.html", "html", "<html><body><form><input type='text'></form></body></html>", 60.0),
            (proj1, "servicios.html", "html", "<html><body><img src='img.png'><div onclick='fn()'></div></body></html>", 40.0),
            (proj1, "styles.css", "css", "body{background:#fff;color:#000;} a{color:#0066cc;}", 90.0),
            # Proyecto 2 — E-commerce
            (proj2, "productos.html", "html", "<html><body><img src='prod.jpg' alt='Producto'><h1>Catálogo</h1></body></html>", 80.0),
            (proj2, "carrito.html", "html", "<html><body><button>Comprar</button><div role='alert'></div></body></html>", 70.0),
            (proj2, "checkout.html", "html", "<html><body><form><label for='name'>Nombre</label><input id='name'></form></body></html>", 95.0),
            (proj2, "theme.css", "css", "body{font-size:16px;} .btn{background:#333;color:#fff;}", 85.0),
            # Proyecto 3 — Blog Educativo
            (proj3, "articulo.html", "html", "<html lang='es'><body><article><h1>Título</h1><p>Contenido</p></article></body></html>", 100.0),
            (proj3, "galeria.html", "html", "<html><body><img src='foto1.jpg'><img src='foto2.jpg'></body></html>", 30.0),
            (proj3, "about.html", "html", "<html><body><h1>Sobre nosotros</h1><a href='#'>Leer más</a></body></html>", 50.0),
            (proj3, "blog.css", "css", ".text{color:#767676;background:#fff;} h1{font-size:2em;}", 75.0),
        ]

        # Asegurar que la carpeta uploads exista
        uploads_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        uploaded_files = []
        for project, filename, ftype, content, score in files_data:
            uf = UploadedFile(
                project=project,
                filename=filename,
                file_type=ftype,
                size_bytes=len(content.encode("utf-8")),
                score=score,
            )
            uf.file.save(filename, ContentFile(content.encode("utf-8")), save=True)
            uploaded_files.append((uf, score))

        self.stdout.write(self.style.SUCCESS("  [OK] 12 archivos creados con scores variados"))

        # ── Reportes y Hallazgos ────────────────────────
        findings_data = {
            "contacto.html": [
                ("error", "WCAG 1.3.1", "Input sin label asociado", 1, "<input type='text'>", "input"),
                ("warning", "WCAG 2.4.6", "Formulario sin descripción", 1, "<form>", "form"),
            ],
            "servicios.html": [
                ("error", "WCAG 1.1.1", "Imagen sin atributo alt", 1, "<img src='img.png'>", "img"),
                ("error", "WCAG 2.1.1", "Elemento no accesible por teclado", 1, "<div onclick='fn()'>", "div"),
                ("warning", "WCAG 4.1.2", "Falta rol ARIA", 1, "<div onclick='fn()'>", "div"),
            ],
            "galeria.html": [
                ("error", "WCAG 1.1.1", "Imagen sin atributo alt", 1, "<img src='foto1.jpg'>", "img"),
                ("error", "WCAG 1.1.1", "Imagen sin atributo alt", 1, "<img src='foto2.jpg'>", "img"),
                ("error", "WCAG 3.1.1", "Falta atributo lang en html", 1, "<html>", "html"),
            ],
            "about.html": [
                ("warning", "WCAG 2.4.4", "Enlace con texto genérico", 1, "<a href='#'>Leer más</a>", "a"),
                ("error", "WCAG 3.1.1", "Falta atributo lang en html", 1, "<html>", "html"),
            ],
            "theme.css": [
                ("warning", "WCAG 1.4.3", "Contraste bajo en botón (#333 sobre #fff)", 1, ".btn{background:#333;color:#fff;}", ".btn"),
            ],
            "blog.css": [
                ("error", "WCAG 1.4.3", "Contraste insuficiente (#767676 sobre #fff = 4.48:1)", 1, ".text{color:#767676;background:#fff;}", ".text"),
            ],
        }

        for uf, score in uploaded_files:
            has_errors = uf.filename in findings_data
            status = "Fallas" if has_errors and any(
                f[0] == "error" for f in findings_data.get(uf.filename, [])
            ) else "Aprobado"

            report = AuditResult.objects.create(
                uploaded_file=uf,
                status=status,
            )

            if uf.filename in findings_data:
                Finding.objects.bulk_create([
                    Finding(
                        audit_result=report,
                        severity=sev,
                        wcag_rule=rule,
                        message=msg,
                        line_number=line,
                        code_snippet=snippet,
                        affected_element=element,
                    )
                    for sev, rule, msg, line, snippet, element in findings_data[uf.filename]
                ])

        self.stdout.write(self.style.SUCCESS("  [OK] Reportes y hallazgos creados"))
        self.stdout.write(self.style.SUCCESS("\nDatos de prueba cargados exitosamente!"))
        self.stdout.write(
            "\n  Credenciales de prueba:\n"
            "  ------------------------\n"
            f"  Admin:  dev1@opticode.com / {password}\n"
            f"  Users:  dev2@opticode.com - dev5@opticode.com / {password}\n"
        )
