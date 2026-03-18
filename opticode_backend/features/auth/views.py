from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    """
    Endpoint público para el registro de nuevos usuarios.

    **Método:** POST
    **URL:** /api/auth/register/

    **Ejemplo de Payload (JSON) requerido:**
    ```json
    {
        "username": "usuario_ejemplo",
        "email": "correo@ejemplo.com",
        "first_name": "Nombre",
        "last_name": "Apellido",
        "password": "ContraseñaSegura123!",
        "password_confirm": "ContraseñaSegura123!"
    }
    ```

    **Respuestas:**
    - `201 Created`: Usuario registrado exitosamente.
    - `400 Bad Request`: Error en validación (email duplicado, contraseñas no coinciden, contraseña débil).
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Opcional: Retornar tokens aqui si se desea login automatico
        
        return Response({
            "user": {
                "email": user.email,
                "username": user.username
            },
            "message": "Usuario creado exitosamente.",
        }, status=status.HTTP_201_CREATED)
