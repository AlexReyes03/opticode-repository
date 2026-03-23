from django.contrib import admin

from features.audit.models import AuditResult, Finding, UploadedFile


class FindingInline(admin.TabularInline):
    model = Finding
    extra = 0


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ("filename", "file_type", "project", "size_bytes", "score")
    list_filter = ("file_type",)


@admin.register(AuditResult)
class AuditResultAdmin(admin.ModelAdmin):
    list_display = ("uploaded_file", "status", "analyzed_at")
    list_filter = ("status",)
    inlines = [FindingInline]


@admin.register(Finding)
class FindingAdmin(admin.ModelAdmin):
    list_display = ("wcag_rule", "severity", "line_number", "audit_result")
    list_filter = ("severity", "wcag_rule")
