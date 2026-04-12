def get_sensitive_fields(model):
    """
    Obtiene la lista de campos sensibles directamente como atributo del modelo.
    Por defecto y por seguridad obligatoria, añade siempre 'password'.
    """
    fields = getattr(model, 'audit_sensitive_fields', [])
    if 'password' not in fields:
        fields = list(fields) + ['password']
    return fields

def capture_old_state(sender, instance, **kwargs):
    """
    Señal pre_save para capturar el estado original del modelo antes 
    de que se guarde en la base de datos (vital para los UPDATES).
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
    Señal post_save para registrar INSERTS y UPDATES sin utilizar JSON,
    evaluando campo por campo.
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
        # INSERCIÓN: Guardamos 1 fila por campo, PERO omitimos nulos y vacíos.
        for field in instance._meta.fields:
            value = getattr(instance, field.attname)
            
            # Filtro anti-basura: Solo registrar si el valor realmente existe
            if value is not None and value != '':
                if field.name in sensitive_fields:
                    final_value = '******'
                else:
                    final_value = str(value)
                    
                AuditLog.objects.create(
                    model_name=sender.__name__,
                    field_name=field.name,
                    action='INSERT',
                    old_value=None,
                    new_value=final_value,
                    user=user,
                    ip_address=ip
                )
    else:
        # ACTUALIZACIÓN: Comparar rigurosamente campo VS campo
        if hasattr(instance, '_old_state') and instance._old_state:
            old_instance = instance._old_state
            for field in instance._meta.fields:
                old_value = getattr(old_instance, field.attname)
                new_value = getattr(instance, field.attname)
                
                # Solo guardar si en verdad cambió el valor
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
    Señal post_delete para registrar DELETES. Guarda únicamente el ID
    para evitar inflar masivamente la tabla con campos nullos.
    """
    from auditlog.models import AuditLog
    from auditlog.middleware import get_current_user, get_current_ip

    if sender.__name__ == 'AuditLog':
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    ip = get_current_ip()
    
    # Obtener el ID dinámico (usualmente 'id')
    pk_field = instance._meta.pk
    pk_value = getattr(instance, pk_field.attname)

    # BORRADO: Guardar una singular línea avisando qué llave primaria fue destruida
    AuditLog.objects.create(
        model_name=sender.__name__,
        field_name=pk_field.name,
        action='DELETE',
        old_value=str(pk_value) if pk_value is not None else None,
        new_value=None,
        user=user,
        ip_address=ip
    )
