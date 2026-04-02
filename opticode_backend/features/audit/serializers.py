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
            "severity",
            "wcag_rule",
            "message",
            "line_number",
            "code_snippet",
            "category",
        ]
        read_only_fields = fields


class AuditResultSerializer(serializers.ModelSerializer):
    score = serializers.FloatField(source="uploaded_file.score", read_only=True)
    created_at = serializers.DateTimeField(source="analyzed_at", read_only=True)
    findings = FindingSerializer(many=True, read_only=True)

    class Meta:
        model = AuditResult
        fields = ["score", "created_at", "findings"]
        read_only_fields = fields
