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
    Señal post_save para registrar INSERTS y UPDATES.
    """
    from auditlog.models import AuditLog
    from auditlog.middleware import get_current_user, get_current_ip

    if sender.__name__ == 'AuditLog':
        return

    user = get_current_user()
    # Asegurar que el objeto user esté instanciado y autenticado, o ser null
    if user and not user.is_authenticated:
        user = None

    ip = get_current_ip()

    if created:
        # Es una inserción nueva, guardaremos todos los valores como INSERT
        for field in instance._meta.fields:
            value = getattr(instance, field.attname)
            AuditLog.objects.create(
                model_name=sender.__name__,
                field_name=field.name,
                action='INSERT',
                old_value=None,
                new_value=str(value) if value is not None else None,
                user=user,
                ip_address=ip
            )
    else:
        # Es una actualización, compararemos cada campo
        if hasattr(instance, '_old_state') and instance._old_state:
            old_instance = instance._old_state
            for field in instance._meta.fields:
                old_value = getattr(old_instance, field.attname)
                new_value = getattr(instance, field.attname)
                
                # Solo loguear si el campo realmente cambió
                if old_value != new_value:
                    AuditLog.objects.create(
                        model_name=sender.__name__,
                        field_name=field.name,
                        action='UPDATE',
                        old_value=str(old_value) if old_value is not None else None,
                        new_value=str(new_value) if new_value is not None else None,
                        user=user,
                        ip_address=ip
                    )

def audit_post_delete(sender, instance, **kwargs):
    """
    Señal post_delete para registrar DELETES.
    """
    from auditlog.models import AuditLog
    from auditlog.middleware import get_current_user, get_current_ip

    if sender.__name__ == 'AuditLog':
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    ip = get_current_ip()

    # Como se borró, guardamos un registro por campo como DELETE
    for field in instance._meta.fields:
        old_value = getattr(instance, field.attname)
        AuditLog.objects.create(
            model_name=sender.__name__,
            field_name=field.name,
            action='DELETE',
            old_value=str(old_value) if old_value is not None else None,
            new_value=None,
            user=user,
            ip_address=ip
        )
