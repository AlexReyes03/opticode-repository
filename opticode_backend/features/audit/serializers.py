from rest_framework import serializers

from features.audit.models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "project",
            "filename",
            "file_type",
            "file",
            "size_bytes",
            "score",
            "created_at",
        ]
        read_only_fields = ["id", "size_bytes", "score", "created_at"]
