import zipfile
from io import BytesIO

import openpyxl
from django.core.files.base import ContentFile
from django.http import FileResponse
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from features.audit.engine import run_audit
from features.audit.models import UploadedFile
from features.projects.models import Project

ALLOWED_EXTENSIONS = {"html", "css"}
MIN_SIZE = 1_024           # 1 KB
MAX_SIZE = 10_485_760      # 10 MB
ZIP_MAX_SIZE = 52_428_800  # 50 MB
ZIP_MAX_FILES = 50
MIN_SIZE = 1_024          # 1 KB
MAX_SIZE = 10_485_760     # 10 MB


def _detect_file_type(content: bytes) -> str | None:
    """
    Detecta si el contenido corresponde a HTML o CSS leyendo los primeros bytes.
    Retorna 'html', 'css', o None si no se reconoce.
    """
    sample = content[:512].decode("utf-8", errors="ignore").strip().lower()

    if (
        sample.startswith("<!doctype html")
        or sample.startswith("<html")
        or "<head" in sample
        or "<body" in sample
    ):
        return UploadedFile.FileType.HTML

    if "{" in sample and "}" in sample and ":" in sample:
        return UploadedFile.FileType.CSS

    return None


class FileUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Proyecto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "No se proporcionó ningún archivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar extensión
        ext = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else ""
        if ext not in ALLOWED_EXTENSIONS:
            return Response(
                {"detail": "Extensión no permitida. Solo se aceptan archivos .html y .css."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar tamaño
        if not (MIN_SIZE <= file.size <= MAX_SIZE):
            return Response(
                {"detail": "El archivo debe pesar entre 1 KB y 10 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar tipo real leyendo bytes
        content = file.read()
        file.seek(0)

        detected_type = _detect_file_type(content)
        if detected_type is None:
            return Response(
                {"detail": "El contenido del archivo no corresponde a HTML ni CSS válido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Overwrite si ya existe un archivo con el mismo nombre en el proyecto
        existing = UploadedFile.objects.filter(project=project, filename=file.name).first()
        if existing:
            existing.file.delete(save=False)
            existing.file = file
            existing.file_type = detected_type
            existing.size_bytes = file.size
            existing.score = None
            existing.save()
            uploaded = existing
        else:
            uploaded = UploadedFile.objects.create(
                project=project,
                filename=file.name,
                file=file,
                file_type=detected_type,
                size_bytes=file.size,
            )

        run_audit(uploaded, content=content.decode("utf-8", errors="ignore"))

        return Response(
            {
                "id": uploaded.pk,
                "filename": uploaded.filename,
                "file_type": uploaded.file_type,
                "size_bytes": uploaded.size_bytes,
            },
            status=status.HTTP_201_CREATED,
        )


def _save_or_overwrite(project, filename, content, file_type):
    """Guarda o sobreescribe un UploadedFile. Retorna la instancia."""
    existing = UploadedFile.objects.filter(project=project, filename=filename).first()
    if existing:
        existing.file.delete(save=False)
        existing.file = ContentFile(content, name=filename)
        existing.file_type = file_type
        existing.size_bytes = len(content)
        existing.score = None
        existing.save()
        return existing
    return UploadedFile.objects.create(
        project=project,
        filename=filename,
        file=ContentFile(content, name=filename),
        file_type=file_type,
        size_bytes=len(content),
    )


class ZipUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Proyecto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "No se proporcionó ningún archivo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ext = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else ""
        if ext != "zip":
            return Response(
                {"detail": "Solo se aceptan archivos .zip."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if file.size > ZIP_MAX_SIZE:
            return Response(
                {"detail": "El ZIP no puede superar los 50 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            zf = zipfile.ZipFile(BytesIO(file.read()))
        except zipfile.BadZipFile:
            return Response(
                {"detail": "El archivo ZIP está corrupto o no es válido."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Filtrar entradas válidas (no directorios, extensión html/css)
        entries = [
            e for e in zf.infolist()
            if not e.is_dir()
            and e.filename.rsplit(".", 1)[-1].lower() in ALLOWED_EXTENSIONS
        ]

        ignored = []

        if len(entries) > ZIP_MAX_FILES:
            return Response(
                {"detail": f"El ZIP contiene más de {ZIP_MAX_FILES} archivos .html/.css."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded = []

        for entry in entries:
            filename = entry.filename.split("/")[-1]  # descartar rutas internas
            content = zf.read(entry.filename)
            size = len(content)

            if not (MIN_SIZE <= size <= MAX_SIZE):
                ignored.append({
                    "filename": filename,
                    "reason": f"Tamaño fuera de rango ({size} bytes). Debe estar entre 1 KB y 10 MB.",
                })
                continue

            file_type = _detect_file_type(content)
            if file_type is None:
                ignored.append({
                    "filename": filename,
                    "reason": "El contenido no corresponde a HTML ni CSS válido.",
                })
                continue

            saved = _save_or_overwrite(project, filename, content, file_type)
            run_audit(saved, content=content.decode("utf-8", errors="ignore"))
            uploaded.append({
                "id": saved.pk,
                "filename": saved.filename,
                "file_type": saved.file_type,
                "size_bytes": saved.size_bytes,
            })

        # Archivos del ZIP con extensión no permitida
        skipped_extensions = [
            e for e in zf.infolist()
            if not e.is_dir()
            and e.filename.rsplit(".", 1)[-1].lower() not in ALLOWED_EXTENSIONS
        ]
        for entry in skipped_extensions:
            ignored.append({
                "filename": entry.filename.split("/")[-1],
                "reason": "Extensión no permitida.",
            })

        return Response(
            {"uploaded": uploaded, "ignored": ignored},
            status=status.HTTP_201_CREATED,
        )


class ProjectExportExcelView(APIView):
    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": "Proyecto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Project Data"

        ws.append(["File Name", "File Type", "Size (bytes)", "Score"])

        files = UploadedFile.objects.filter(project=project)
        for f in files:
            ws.append([f.filename, f.file_type, f.size_bytes, getattr(f, 'score', 'N/A')])

        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        filename = f"project_{pk}_export.xlsx"
        return FileResponse(
            buffer,
            as_attachment=True,
            filename=filename,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
