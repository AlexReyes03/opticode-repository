from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from features.users.serializers import SuspendUserSerializer, UserListSerializer

User = get_user_model()


class UserListView(generics.ListAPIView):
    """GET /api/users/ — Lista todos los usuarios (solo staff)."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]


class SuspendUserView(generics.UpdateAPIView):
    """PATCH /api/users/<id>/suspend/ — Suspende un usuario (is_active=False)."""

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

        user.is_active = False
        user.save(update_fields=["is_active"])

        serializer = self.get_serializer(user)
        return Response(serializer.data)




