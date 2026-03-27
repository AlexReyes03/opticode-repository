from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from features.audit.models import UploadedFile
from features.projects.models import Project

ALLOWED_EXTENSIONS = {"html", "css"}
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

        return Response(
            {
                "id": uploaded.pk,
                "filename": uploaded.filename,
                "file_type": uploaded.file_type,
                "size_bytes": uploaded.size_bytes,
            },
            status=status.HTTP_201_CREATED,
        )
