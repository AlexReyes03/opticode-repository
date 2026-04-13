from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .crypto_rsa import decrypt_oaep_b64, rsa_configured

User = get_user_model()


def _validate_password_policy(value):
    if len(value) < 8:
        raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
    if not any(char.isupper() for char in value):
        raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
    if not any(char.isdigit() for char in value):
        raise serializers.ValidationError("La contraseña debe contener al menos un número.")
    return value


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    email_cipher = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_cipher = serializers.CharField(write_only=True, required=False, allow_blank=True)
    key_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = (
            "email",
            "email_cipher",
            "password",
            "password_cipher",
            "key_id",
            "first_name",
            "last_name",
        )

    def validate(self, attrs):
        email_cipher = (attrs.pop("email_cipher", None) or "").strip()
        key_id = (attrs.pop("key_id", None) or "").strip() or None
        email_plain = (attrs.get("email") or "").strip()

        if email_cipher:
            if not rsa_configured():
                raise serializers.ValidationError(
                    {"email_cipher": "El servidor no tiene cifrado de credenciales configurado."}
                )
            try:
                resolved_email = decrypt_oaep_b64(email_cipher, key_id)
            except ValueError as exc:
                raise serializers.ValidationError({"email_cipher": str(exc)}) from exc
            email_field = serializers.EmailField()
            attrs["email"] = email_field.run_validation(resolved_email)
        elif not email_plain:
            raise serializers.ValidationError(
                {"email": "Indica el correo o envía email_cipher cifrado con la clave pública."}
            )
        else:
            attrs["email"] = email_plain

        password_cipher = (attrs.pop("password_cipher", None) or "").strip()
        password_plain = (attrs.get("password") or "").strip()

        if password_cipher:
            if not rsa_configured():
                raise serializers.ValidationError(
                    {"password_cipher": "El servidor no tiene cifrado de credenciales configurado."}
                )
            try:
                attrs["password"] = decrypt_oaep_b64(password_cipher, key_id)
            except ValueError as exc:
                raise serializers.ValidationError({"password_cipher": str(exc)}) from exc
        elif not password_plain:
            raise serializers.ValidationError(
                {"password": "Indica la contraseña o envía password_cipher cifrado con la clave pública."}
            )
        else:
            attrs["password"] = password_plain

        attrs["password"] = _validate_password_policy(attrs["password"])
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(username=validated_data["email"], **validated_data)
        user.last_password_changed = user.date_joined
        user.save(update_fields=["last_password_changed"])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    email_cipher = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_cipher = serializers.CharField(write_only=True, required=False, allow_blank=True)
    key_id = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate(self, attrs):
        email_cipher = (attrs.pop("email_cipher", None) or "").strip()
        key_id = (attrs.pop("key_id", None) or "").strip() or None
        email_plain = (attrs.get("email") or "").strip()

        if email_cipher:
            if not rsa_configured():
                raise serializers.ValidationError(
                    {"email_cipher": "El servidor no tiene cifrado de credenciales configurado."}
                )
            try:
                resolved_email = decrypt_oaep_b64(email_cipher, key_id)
            except ValueError as exc:
                raise serializers.ValidationError({"email_cipher": str(exc)}) from exc
            email_field = serializers.EmailField()
            attrs["email"] = email_field.run_validation(resolved_email)
        elif email_plain:
            attrs["email"] = email_plain
        else:
            raise serializers.ValidationError(
                {"email": "Indica el correo o envía email_cipher cifrado con la clave pública."}
            )

        password_cipher = (attrs.pop("password_cipher", None) or "").strip()
        password_plain = (attrs.get("password") or "").strip()

        if password_cipher:
            if not rsa_configured():
                raise serializers.ValidationError(
                    {"password_cipher": "El servidor no tiene cifrado de credenciales configurado."}
                )
            try:
                attrs["password"] = decrypt_oaep_b64(password_cipher, key_id)
            except ValueError as exc:
                raise serializers.ValidationError({"password_cipher": str(exc)}) from exc
        elif not password_plain:
            raise serializers.ValidationError(
                {"password": "Indica la contraseña o envía password_cipher cifrado con la clave pública."}
            )
        else:
            attrs["password"] = password_plain

        if not attrs["password"]:
            raise serializers.ValidationError({"password": "La contraseña no puede estar vacía."})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        return _validate_password_policy(value)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
    Acepta contraseñas en claro o cifradas (RSA-OAEP), igual que login/registro.
    `key_id` aplica a los campos *_cipher presentes.
    """

    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    current_password_cipher = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password_cipher = serializers.CharField(write_only=True, required=False, allow_blank=True)
    key_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    confirm_password_cipher = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate(self, attrs):
        key_id = (attrs.pop("key_id", None) or "").strip() or None
        current_cipher = (attrs.pop("current_password_cipher", None) or "").strip()
        new_cipher = (attrs.pop("new_password_cipher", None) or "").strip()
        confirm_cipher = (attrs.pop("confirm_password_cipher", None) or "").strip()
        current_plain = (attrs.pop("current_password", None) or "").strip()
        new_plain = (attrs.pop("new_password", None) or "").strip()
        confirm_plain = (attrs.pop("confirm_password", None) or "").strip()

        if current_cipher:
            if not rsa_configured():
                raise serializers.ValidationError(
                    {"current_password_cipher": "El servidor no tiene cifrado de credenciales configurado."}
                )
            try:
                current_resolved = decrypt_oaep_b64(current_cipher, key_id)
            except ValueError as exc:
                raise serializers.ValidationError({"current_password_cipher": str(exc)}) from exc
        elif current_plain:
            current_resolved = current_plain
        else:
            raise serializers.ValidationError(
                {"current_password": "Indica la contraseña actual o envía current_password_cipher cifrado."}
            )

        if new_cipher:
            if not rsa_configured():
                raise serializers.ValidationError(
                    {"new_password_cipher": "El servidor no tiene cifrado de credenciales configurado."}
                )
            try:
                new_resolved = decrypt_oaep_b64(new_cipher, key_id)
            except ValueError as exc:
                raise serializers.ValidationError({"new_password_cipher": str(exc)}) from exc
        elif new_plain:
            new_resolved = new_plain
        else:
            raise serializers.ValidationError(
                {"new_password": "Indica la nueva contraseña o envía new_password_cipher cifrado."}
            )

        new_resolved = _validate_password_policy(new_resolved)

        if confirm_cipher:
            if not rsa_configured():
                raise serializers.ValidationError(
                    {"confirm_password_cipher": "El servidor no tiene cifrado de credenciales configurado."}
                )
            try:
                confirm_resolved = decrypt_oaep_b64(confirm_cipher, key_id)
            except ValueError as exc:
                raise serializers.ValidationError({"confirm_password_cipher": str(exc)}) from exc
        elif confirm_plain:
            confirm_resolved = confirm_plain
        else:
            raise serializers.ValidationError(
                {"confirm_password": "Indica la confirmación o envía confirm_password_cipher cifrado."}
            )

        if new_resolved != confirm_resolved:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})

        return {"current_password": current_resolved, "new_password": new_resolved}
