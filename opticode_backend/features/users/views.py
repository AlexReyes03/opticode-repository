from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from features.users.serializers import SuspendUserSerializer, UserListSerializer

User = get_user_model()


class UserListView(generics.ListAPIView):
    """GET /api/users/ — Lista todos los usuarios (solo staff)."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]


class SuspendUserView(generics.UpdateAPIView):
    """PATCH /api/users/<id>/suspend/ — Alterna el estado activo/suspendido de un usuario."""

    queryset = User.objects.all()
    serializer_class = SuspendUserSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["patch"]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()

        if user == request.user:
            return Response(
                {"detail": "No puedes suspenderte a ti mismo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Toggle: si estaba activo lo suspende, si estaba suspendido lo reactiva
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        serializer = self.get_serializer(user)
        return Response(serializer.data)


class DeleteUserView(APIView):
    """DELETE /api/users/<id>/delete/ — Elimina un usuario (solo staff)."""

    permission_classes = [IsAdminUser]

    def delete(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user == request.user:
            return Response(
                {"detail": "No puedes eliminarte a ti mismo."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
