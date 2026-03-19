from django.db import models


class UploadedFile(models.Model):
    class FileType(models.TextChoices):
        HTML = "html", "HTML"
        CSS = "css", "CSS"

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="uploaded_files",
    )
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FileType.choices)
    file = models.FileField(upload_to="uploads/")
    size_bytes = models.PositiveIntegerField()
    score = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = "uploaded_files"
        verbose_name = "archivo subido"
        verbose_name_plural = "archivos subidos"
        unique_together = [("project", "filename")]

    def __str__(self):
        return self.filename


class AuditResult(models.Model):
    class Status(models.TextChoices):
        APPROVED = "Aprobado", "Aprobado"
        FAILED = "Fallas", "Fallas"

    uploaded_file = models.OneToOneField(
        UploadedFile,
        on_delete=models.CASCADE,
        related_name="audit_result",
    )
    status = models.CharField(max_length=20, choices=Status.choices)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reportes"
        verbose_name = "reporte"
        verbose_name_plural = "reportes"

    def __str__(self):
        return f"{self.uploaded_file.filename} - {self.status}"



