def auto_fill_audit_fields(_sender, instance, **kwargs):
    """
    Señal pre_save universal para llenar 'created_by' y 'updated_by' automáticamente
    antes de que el modelo se guarde en la Base de Datos.
    """
    from auditlog.middleware import get_current_user
    
    # Tratamos de obtener el usuario que hizo la petición
    user = get_current_user()
    
    if user and not user.is_authenticated:
        user = None

    if user:
        # Verificamos si la tabla tiene los campos de Tablas Auditables
        if hasattr(instance, 'created_by') and hasattr(instance, 'updated_by'):
            # instance._state.adding nos dice si es un INSERT (nuevo)
            if instance._state.adding:
                # Solo llenarlo si no viene pre-asignado a mano
                if getattr(instance, 'created_by_id', None) is None:
                    instance.created_by = user
            
            # Sin importar si es INSERT o UPDATE, siempre se renueva el updated_by
            instance.updated_by = user
