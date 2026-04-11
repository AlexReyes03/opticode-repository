import threading

# Thread-local storage para guardar los datos del request actual
_thread_locals = threading.local()

def get_current_user():
    """Obtiene el usuario del request actual."""
    return getattr(_thread_locals, 'user', None)

def get_current_ip():
    """Obtiene la IP del request actual."""
    return getattr(_thread_locals, 'ip_address', None)

class AuditLogMiddleware:
    """
    Middleware que intercepta cada request para guardar el usuario actual 
    y la dirección IP en thread-local storage, de modo que las señales (signals)
    puedan acceder a esta información sin necesidad de recibir el request empírico.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Guardamos en thread-local el usuario y la IP antes de procesar la vista
        # Nota: para el usuario, asume que AuthenticationMiddleware ya corrió.
        _thread_locals.user = getattr(request, 'user', None)
        _thread_locals.ip_address = self.get_client_ip(request)
        
        response = self.get_response(request)
        
        # Limpieza para evitar fugas de memoria si se reúsan los hilos (workers)
        if hasattr(_thread_locals, 'user'):
            del _thread_locals.user
        if hasattr(_thread_locals, 'ip_address'):
            del _thread_locals.ip_address
            
        return response

    def get_client_ip(self, request):
        """Extrae la dirección IP real del cliente."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
