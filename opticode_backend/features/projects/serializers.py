from rest_framework import serializers
from .models import Project
from features.audit.models import UploadedFile  # <-- Importación nueva necesaria

class ProjectSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ("id", "name", "description", "created_at", "updated_at", "file_count")
        read_only_fields = ("id", "created_at", "updated_at", "file_count")

    def get_file_count(self, obj):
        return obj.uploaded_files.count()

class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ("id", "filename", "file_type", "size_bytes", "score")
        # El campo 'created_at' no existe en el modelo actual de UploadedFile, así que lo omitimos
