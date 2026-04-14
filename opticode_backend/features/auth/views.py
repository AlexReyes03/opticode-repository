from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status, views
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .crypto_rsa import public_key_bundle
from .services import (
    check_login_throttle_before_auth,
    clear_login_throttle,
    normalize_login_email,
    record_failed_login,
)
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
)

User = get_user_model()


class AuthPublicKeyView(views.APIView):
    """
    Expone la clave pública RSA (SPKI PEM) para cifrado OAEP-SHA256 en el cliente.
    Si AUTH_RSA_PRIVATE_KEY no está definida, devuelve enabled=false (solo contraseña en claro).
    """

    permission_classes = [AllowAny]

    def get(self, request):
        bundle = public_key_bundle()
        if bundle is None:
            return Response({"enabled": False}, status=status.HTTP_200_OK)
        return Response(bundle, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            email_key = normalize_login_email(email)
            blocked = check_login_throttle_before_auth(request, email_key)
            if blocked is not None:
                return blocked

            user = authenticate(request, username=email, password=password)

            if user is not None:
                clear_login_throttle(email_key)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            return record_failed_login(request, email_key)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(views.APIView):
    """
    Invalida el refresh token en el server meta en blacklist.
    Recibe { refresh } en el body y lo revoca.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'El refresh token es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'detail': 'Logout exitoso. Token revocado.'},
                status=status.HTTP_200_OK
            )
        except TokenError:
            return Response(
                {'error': 'Token inválido o expirado.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception:
            return Response(
                {'error': 'Error al revocar el token.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MeView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'date_joined': user.date_joined,
                'last_password_changed': user.last_password_changed,
            },
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        generic_response = Response(
            {'detail': 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.'},
            status=status.HTTP_200_OK,
        )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return generic_response

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:5173/reset-password?uid={uid}&token={token}"

        send_mail(
            subject="Restablecer contraseña — OptiCode",
            message=(
                f"Hola {user.first_name},\n\n"
                f"Haz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_link}\n\n"
                "El enlace expira en 30 minutos.\n\n"
                "Si no solicitaste este cambio, ignora este correo."
            ),
            from_email="noreply@opticode.app",
            recipient_list=[user.email],
            fail_silently=True,
        )

        return generic_response


class ResetPasswordView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Enlace inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'El enlace ha expirado o ya fue utilizado.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.last_password_changed = timezone.now()
        user.save(update_fields=['password', 'last_login', 'last_password_changed'])

        return Response({'detail': 'Contraseña restablecida correctamente.'}, status=status.HTTP_200_OK)


class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return Response({'error': 'La contraseña actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.last_password_changed = timezone.now()
        user.save(update_fields=['password', 'last_password_changed'])

        return Response({'detail': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)