from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name")

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError(
                "La contraseña debe contener al menos una letra mayúscula."
            )
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(username=validated_data["email"], **validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
