from rest_framework import generics, permissions
from .models import Project
from .serializers import ProjectSerializer

class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra los proyectos para mostrar solo los del usuario actual
        return Project.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario logueado como dueño del proyecto
        serializer.save(owner=self.request.user)