from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from features.audit.models import Finding, UploadedFile
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ("id", "name", "description", "created_at", "updated_at", "file_count")
        read_only_fields = ("id", "created_at", "updated_at", "file_count")

    def get_file_count(self, obj):
        return obj.uploaded_files.count()

class UploadedFileSerializer(serializers.ModelSerializer):
    critical_count = serializers.SerializerMethodField()
    warning_count = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = (
            "id",
            "filename",
            "file_type",
            "size_bytes",
            "score",
            "updated_at",
            "critical_count",
            "warning_count",
        )

    def get_critical_count(self, obj):
        try:
            ar = obj.audit_result
        except ObjectDoesNotExist:
            return 0
        return ar.findings.filter(severity=Finding.Severity.ERROR).count()

    def get_warning_count(self, obj):
        try:
            ar = obj.audit_result
        except ObjectDoesNotExist:
            return 0
        return ar.findings.filter(severity=Finding.Severity.WARNING).count()
