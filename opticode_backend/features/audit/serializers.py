from rest_framework import serializers

from features.audit.models import AuditResult, Finding, UploadedFile


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


class FindingSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="affected_element", read_only=True)

    class Meta:
        model = Finding
        fields = [
            "id",
            "severity",
            "wcag_level",
            "wcag_rule",
            "message",
            "line_number",
            "code_snippet",
            "category",
        ]
        read_only_fields = fields


class AuditResultSerializer(serializers.ModelSerializer):
    score = serializers.FloatField(source="uploaded_file.score", read_only=True)
    filename = serializers.CharField(source="uploaded_file.filename", read_only=True)
    critical_count = serializers.SerializerMethodField()
    warning_count = serializers.SerializerMethodField()
    improvement_count = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(source="analyzed_at", read_only=True)

    def get_critical_count(self, obj):
        return obj.findings.filter(severity=Finding.Severity.ERROR).count()

    def get_warning_count(self, obj):
        return obj.findings.filter(severity=Finding.Severity.WARNING).count()

    def get_improvement_count(self, obj):
        return obj.findings.filter(severity=Finding.Severity.IMPROVEMENT).count()

    class Meta:
        model = AuditResult
        fields = ["score", "filename", "critical_count", "warning_count", "improvement_count", "status", "created_at"]
        read_only_fields = fields
