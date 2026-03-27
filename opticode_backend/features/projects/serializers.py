from rest_framework import serializers
from .models import Project
from features.audit.models import UploadedFile  # <-- Importación nueva necesaria



class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ("id", "filename", "file_type", "size_bytes", "score")
        # El campo 'created_at' no existe en el modelo actual de UploadedFile, así que lo omitimos