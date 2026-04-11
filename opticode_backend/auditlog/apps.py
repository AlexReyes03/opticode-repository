from django.apps import AppConfig, apps
from django.db.models.signals import pre_save, post_save, post_delete

class AuditlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'auditlog'
    verbose_name = 'Bitácora de Auditoría'

    def ready(self):
        # Importar los manejadores de señales
        from . import signals
        
        # apps.get_models() devuelve todos los modelos concretos (no abstractos)
        for model in apps.get_models():
            # Excluir el propio modelo AuditLog para no crear ciclos infinitos
            if model.__name__ == 'AuditLog':
                continue
                
            # Excluir modelos no gestionados por Django que no necesiten auditoría (opcional)
            if not model._meta.managed:
                continue
                
            # Conectar dinámicamente las señales a cada modelo
            pre_save.connect(signals.capture_old_state, sender=model)
            post_save.connect(signals.audit_post_save, sender=model)
            post_delete.connect(signals.audit_post_delete, sender=model)
