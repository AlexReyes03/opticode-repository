from rest_framework import serializers

from features.audit.models import Finding, UploadedFile


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
    """
    Expone el hallazgo tal como está en BD; `affected_element` recibe el valor
    mapeado desde `category` en las reglas (ver ``engine.persist_findings``).
    """

    class Meta:
        model = Finding
        fields = [
            "id",
            "audit_result",
            "severity",
            "wcag_rule",
            "message",
            "line_number",
            "code_snippet",
            "affected_element",
        ]
        read_only_fields = fields
