from rest_framework import generics, permissions
from .models import Project
from features.audit.models import UploadedFile
from .serializers import ProjectSerializer, UploadedFileSerializer # Asegúrate de importar el nuevo serializer


class ProjectFilesView(generics.ListAPIView):
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra por el ID del proyecto (viene en la URL como 'pk')
        # Y verifica que el proyecto pertenezca al usuario logueado
        project_id = self.kwargs["pk"]
        return UploadedFile.objects.filter(
            project_id=project_id,
            project__owner=self.request.user
        )