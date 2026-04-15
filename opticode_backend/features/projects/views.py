import zipfile
from io import BytesIO

import openpyxl
from django.core.files.base import ContentFile
from django.http import FileResponse
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from features.audit.engine import run_audit
from features.audit.models import UploadedFile
from features.projects.models import Project
from features.projects.serializers import ProjectSerializer, UploadedFileSerializer

ALLOWED_EXTENSIONS = {"html", "css"}
MAX_SIZE = 10_485_760      # 10 MB (tamaño mínimo permitido: 0 B)
ZIP_MAX_SIZE = 52_428_800  # 50 MB
ZIP_MAX_FILES = 50
PROJECT_NOT_FOUND_MESSAGE = "Proyecto no encontrado."


class ProjectListCreateView(ListCreateAPIView):
    """GET lista proyectos del usuario; POST crea uno (owner = request.user)."""

    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user).order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectRetrieveUpdateView(RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE de un proyecto propio (DELETE elimina el registro y datos en cascada)."""

    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)


class ProjectFileListView(APIView):
    """GET: archivos subidos del proyecto (solo si el usuario es el propietario)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": PROJECT_NOT_FOUND_MESSAGE},
                status=status.HTTP_404_NOT_FOUND,
            )

        qs = (
            UploadedFile.objects.filter(project=project)
            .select_related("audit_result")
            .prefetch_related("audit_result__findings")
            .order_by("-updated_at")
        )
        return Response(UploadedFileSerializer(qs, many=True).data)


class ProjectUploadedFileDestroyView(APIView):
    """DELETE: elimina un archivo del proyecto (propietario únicamente)."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, file_id):
        try:
            project = Project.objects.get(pk=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": PROJECT_NOT_FOUND_MESSAGE},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            uploaded = UploadedFile.objects.get(pk=file_id, project=project)
        except UploadedFile.DoesNotExist:
            return Response(
                {"detail": "Archivo no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if uploaded.file:
            uploaded.file.delete(save=False)
        uploaded.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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


def _file_type_from_extension(filename: str) -> str | None:
    """Si el archivo está vacío, el tipo se infiere solo por extensión (.html/.htm/.css)."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in ("html", "htm"):
        return UploadedFile.FileType.HTML
    if ext == "css":
        return UploadedFile.FileType.CSS
    return None


class FileUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, owner=request.user)
        except Project.DoesNotExist:
            return Response(
                {"detail": PROJECT_NOT_FOUND_MESSAGE},
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

        # Validar tamaño (se permiten archivos vacíos; límite superior 10 MB)
        if file.size > MAX_SIZE:
            return Response(
                {"detail": "El archivo no puede superar los 10 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar tipo real leyendo bytes
        content = file.read()
        file.seek(0)

        detected_type = _detect_file_type(content)
        if detected_type is None and len(content) == 0:
            detected_type = _file_type_from_extension(file.name)
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


def _get_owned_project_or_404(user, pk):
    try:
        return Project.objects.get(pk=pk, owner=user), None
    except Project.DoesNotExist:
        return None, Response(
            {"detail": PROJECT_NOT_FOUND_MESSAGE},
            status=status.HTTP_404_NOT_FOUND,
        )


def _zip_entry_basename(entry):
    return entry.filename.split("/")[-1]


def _build_ignored_entry(filename, reason):
    return {"filename": filename, "reason": reason}


def _valid_zip_entries(zip_file):
    return [
        e for e in zip_file.infolist()
        if not e.is_dir()
        and e.filename.rsplit(".", 1)[-1].lower() in ALLOWED_EXTENSIONS
    ]


def _invalid_extension_entries(zip_file):
    return [
        e for e in zip_file.infolist()
        if not e.is_dir()
        and e.filename.rsplit(".", 1)[-1].lower() not in ALLOWED_EXTENSIONS
    ]


def _resolve_uploaded_file_type(content, filename):
    file_type = _detect_file_type(content)
    if file_type is None and len(content) == 0:
        return _file_type_from_extension(filename)
    return file_type


def _process_zip_entry(project, zip_file, entry):
    filename = _zip_entry_basename(entry)
    content = zip_file.read(entry.filename)
    size = len(content)
    if size > MAX_SIZE:
        return None, _build_ignored_entry(
            filename,
            f"Supera el máximo permitido ({size} bytes). Cada archivo debe pesar como máximo 10 MB.",
        )

    file_type = _resolve_uploaded_file_type(content, filename)
    if file_type is None:
        return None, _build_ignored_entry(
            filename,
            "El contenido no corresponde a HTML ni CSS válido.",
        )

    saved = _save_or_overwrite(project, filename, content, file_type)
    run_audit(saved, content=content.decode("utf-8", errors="ignore"))
    return {
        "id": saved.pk,
        "filename": saved.filename,
        "file_type": saved.file_type,
        "size_bytes": saved.size_bytes,
    }, None


class ZipUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, pk):
        project, error_response = _get_owned_project_or_404(request.user, pk)
        if error_response:
            return error_response

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

        entries = _valid_zip_entries(zf)

        ignored = []

        if len(entries) > ZIP_MAX_FILES:
            return Response(
                {"detail": f"El ZIP contiene más de {ZIP_MAX_FILES} archivos .html/.css."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        uploaded = []

        for entry in entries:
            uploaded_item, ignored_item = _process_zip_entry(project, zf, entry)
            if ignored_item:
                ignored.append(ignored_item)
                continue
            uploaded.append(uploaded_item)

        # Archivos del ZIP con extensión no permitida
        for entry in _invalid_extension_entries(zf):
            ignored.append(
                _build_ignored_entry(_zip_entry_basename(entry), "Extensión no permitida.")
            )

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
                {"detail": PROJECT_NOT_FOUND_MESSAGE},
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
