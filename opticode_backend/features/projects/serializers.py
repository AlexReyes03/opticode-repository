from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ("id", "name", "description", "created_at", "updated_at", "file_count")
        read_only_fields = ("id", "created_at", "updated_at", "file_count")

    def get_file_count(self, obj):
        return obj.uploaded_files.count()