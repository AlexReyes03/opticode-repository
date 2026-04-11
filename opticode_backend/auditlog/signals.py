import json
from django.core.serializers.json import DjangoJSONEncoder

def get_sensitive_fields(model):
    """
    Intenta obtener la lista de campos sensibles directamente como atributo del modelo.
    Por ejemplo, dentro de tu modelo puedes declarar: audit_sensitive_fields = ['api_key']
    Por defecto y por seguridad obligatoria, siempre añade 'password'.
    (Nota técnica: Lo leemos del nivel de clase general y no de class Meta, 
    debido a que internamente Django arroja un ImproperlyConfiguredException 
    si introduces campos que no reconoce formalmente en Meta).
    """
    fields = getattr(model, 'audit_sensitive_fields', [])
    if 'password' not in fields:
        fields = list(fields) + ['password']
    return fields

def get_instance_dict(instance, sensitive_fields):
    """Convierte los atributos manejados por base de datos a un diccionario sanitizado."""
    data = {}
    for field in instance._meta.fields:
        if field.name in sensitive_fields:
            data[field.name] = '******'
        else:
            data[field.name] = getattr(instance, field.attname)
    return data

def capture_old_state(sender, instance, **kwargs):
    """
    Señal pre_save para capturar el estado original del modelo antes 
    de que se guarde en la base de datos (para updates).
    """
    if instance.pk:
        try:
            instance._old_state = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._old_state = None
    else:
        instance._old_state = None

def audit_post_save(sender, instance, created, **kwargs):
    """
    Señal post_save para registrar INSERTS y UPDATES de manera híbrida (JSON vs EAV log).
    """
    from auditlog.models import AuditLog
    from auditlog.middleware import get_current_user, get_current_ip

    if sender.__name__ == 'AuditLog':
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    ip = get_current_ip()
    sensitive_fields = get_sensitive_fields(sender)

    if created:
        # Es una inserción pura: Guardar todos los campos en un solo bloque JSON consolidado
        instance_dict = get_instance_dict(instance, sensitive_fields)
        json_data = json.dumps(instance_dict, cls=DjangoJSONEncoder)
        
        AuditLog.objects.create(
            model_name=sender.__name__,
            field_name='ALL_FIELDS',
            action='INSERT',
            old_value=None,
            new_value=json_data, # Almacena el snapshot JSON
            user=user,
            ip_address=ip
        )
    else:
        # Es una actualización específica: Evaluar EAV tradicional excluyendo valores nulos irrelevantes
        if hasattr(instance, '_old_state') and instance._old_state:
            old_instance = instance._old_state
            for field in instance._meta.fields:
                old_value = getattr(old_instance, field.attname)
                new_value = getattr(instance, field.attname)
                
                # Solo loguear si el campo realmente cambió
                if old_value != new_value:
                    if field.name in sensitive_fields:
                        old_str = '******'
                        new_str = '******'
                    else:
                        old_str = str(old_value) if old_value is not None else None
                        new_str = str(new_value) if new_value is not None else None
                        
                    AuditLog.objects.create(
                        model_name=sender.__name__,
                        field_name=field.name,
                        action='UPDATE',
                        old_value=old_str,
                        new_value=new_str,
                        user=user,
                        ip_address=ip
                    )

def audit_post_delete(sender, instance, **kwargs):
    """
    Señal post_delete para registrar DELETES en bloque JSON unitario.
    """
    from auditlog.models import AuditLog
    from auditlog.middleware import get_current_user, get_current_ip

    if sender.__name__ == 'AuditLog':
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    ip = get_current_ip()
    sensitive_fields = get_sensitive_fields(sender)
    
    # Es un borrado: Guardar como lucía el registro mediante JSON unificado
    instance_dict = get_instance_dict(instance, sensitive_fields)
    json_data = json.dumps(instance_dict, cls=DjangoJSONEncoder)

    AuditLog.objects.create(
        model_name=sender.__name__,
        field_name='ALL_FIELDS',
        action='DELETE',
        old_value=json_data, # Almacena el snapshot inicial como viejo valor perdido
        new_value=None,
        user=user,
        ip_address=ip
    )
