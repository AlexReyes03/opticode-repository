from django.apps import AppConfig


class AuditConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "features.audit"
    label = "audit"
    verbose_name = "Auditoría WCAG"

    def ready(self):
        from . import auditable_signals
        from django.apps import apps
        from django.db.models.signals import pre_save

        # Lista blanca: Solo conectaremos el autollenado a nuestras aplicaciones
        APPS_A_AUDITAR = ['authentication', 'users', 'projects', 'audit', 'auth']

        for model in apps.get_models():
            if model._meta.app_label in APPS_A_AUDITAR:
                # Conectar el pre_save para auto-asignar Usuarios antes de guardar la tabla
                pre_save.connect(auditable_signals.auto_fill_audit_fields, sender=model)
