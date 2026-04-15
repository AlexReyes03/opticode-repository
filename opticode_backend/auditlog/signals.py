MASKED_AUDIT_VALUE = "******"


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


def _resolve_audit_user(get_current_user):
    user = get_current_user()
    if user and not user.is_authenticated:
        return None
    return user


def _format_field_value(field_name, value, sensitive_fields):
    if field_name in sensitive_fields:
        return MASKED_AUDIT_VALUE
    if value is None:
        return None
    return str(value)


def _create_audit_log_entry(
    audit_model,
    sender_name,
    field_name,
    action,
    old_value,
    new_value,
    user,
    ip,
    record_id,
):
    audit_model.objects.create(
        model_name=sender_name,
        field_name=field_name,
        action=action,
        old_value=old_value,
        new_value=new_value,
        user=user,
        ip_address=ip,
        record_id=record_id,
    )


def _log_insert_changes(audit_model, sender, instance, user, ip, sensitive_fields):
    for field in instance._meta.fields:
        value = getattr(instance, field.attname)
        if value is None or value == "":
            continue

        new_value = _format_field_value(field.name, value, sensitive_fields)
        _create_audit_log_entry(
            audit_model=audit_model,
            sender_name=sender.__name__,
            field_name=field.name,
            action="INSERT",
            old_value=None,
            new_value=new_value,
            user=user,
            ip=ip,
            record_id=str(instance.pk),
        )


def _log_update_changes(audit_model, sender, instance, user, ip, sensitive_fields):
    old_instance = getattr(instance, "_old_state", None)
    if not old_instance:
        return

    for field in instance._meta.fields:
        old_value = getattr(old_instance, field.attname)
        new_value = getattr(instance, field.attname)
        if old_value == new_value:
            continue

        old_str = _format_field_value(field.name, old_value, sensitive_fields)
        new_str = _format_field_value(field.name, new_value, sensitive_fields)
        _create_audit_log_entry(
            audit_model=audit_model,
            sender_name=sender.__name__,
            field_name=field.name,
            action="UPDATE",
            old_value=old_str,
            new_value=new_str,
            user=user,
            ip=ip,
            record_id=str(instance.pk),
        )

def audit_post_save(sender, instance, created, **kwargs):
    """
    Señal post_save para registrar INSERTS y UPDATES sin utilizar JSON,
    evaluando campo por campo.
    """
    from auditlog.models import AuditLog
    from auditlog.middleware import get_current_user, get_current_ip

    if sender.__name__ == "AuditLog":
        return

    user = _resolve_audit_user(get_current_user)
    ip = get_current_ip()
    sensitive_fields = get_sensitive_fields(sender)

    if created:
        _log_insert_changes(AuditLog, sender, instance, user, ip, sensitive_fields)
        return

    _log_update_changes(AuditLog, sender, instance, user, ip, sensitive_fields)

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
        ip_address=ip,
        record_id=str(instance.pk)
    )
