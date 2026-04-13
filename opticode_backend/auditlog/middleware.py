import threading

# Thread-local storage para guardar el request en memoriaRAM
_thread_locals = threading.local()

def get_current_request():
    return getattr(_thread_locals, 'request', None)

def get_current_user():
    """Obtiene el usuario verificando dinámicamente el request para leer el JWT de DRF."""
    request = get_current_request()
    if request:
        return getattr(request, 'user', None)
    return None

def get_current_ip():
    """Obtiene la IP de manera dinámica desde el request completo."""
    request = get_current_request()
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
    return None

class AuditLogMiddleware:
    """
    Middleware moderno para guardar el punte al request de forma que las Vistas 
    posteriores (DRF JWT) de React/Angular puedan actualizar al request.user dinámicamente.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # En vez de copiar el numero, ponemos el Request en memoria local
        _thread_locals.request = request
        
        response = self.get_response(request)
        
        # Super importante: Siempre limpiar la basura para evitar fugas de RAM
        if hasattr(_thread_locals, 'request'):
            del _thread_locals.request
            
        return response
