from rest_framework import generics, status, views
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth import authenticate


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
            user = authenticate(request, username=email, password=password)

            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
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
        except Exception as e:
            return Response(
                {'error': 'Error al revocar el token.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )