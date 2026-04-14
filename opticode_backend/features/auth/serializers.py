from django.contrib.auth import get_user_model
from rest_framework import serializers

from .crypto_rsa import decrypt_oaep_b64, rsa_configured

User = get_user_model()

_ERR_RSA_NOT_CONFIGURED = "El servidor no tiene cifrado de credenciales configurado."

_MSG_EMAIL_REQUIRED = "Indica el correo o envía email_cipher cifrado con la clave pública."
_MSG_PASSWORD_REQUIRED = "Indica la contraseña o envía password_cipher cifrado con la clave pública."


def _validate_password_policy(value):
    if len(value) < 8:
        raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
    if not any(char.isupper() for char in value):
        raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
    if not any(char.isdigit() for char in value):
        raise serializers.ValidationError("La contraseña debe contener al menos un número.")
    return value


def _require_rsa_and_decrypt(cipher_b64: str, key_id, field_key: str) -> str:
    if not rsa_configured():
        raise serializers.ValidationError({field_key: _ERR_RSA_NOT_CONFIGURED})
    try:
        return decrypt_oaep_b64(cipher_b64, key_id)
    except ValueError as exc:
        raise serializers.ValidationError({field_key: str(exc)}) from exc


def _resolve_email_from_inputs(email_cipher: str, key_id, email_plain: str) -> str:
    if email_cipher:
        resolved = _require_rsa_and_decrypt(email_cipher, key_id, "email_cipher")
        email_field = serializers.EmailField()
        return email_field.run_validation(resolved)
    if email_plain:
        return email_plain
    raise serializers.ValidationError({"email": _MSG_EMAIL_REQUIRED})


def _resolve_password_from_inputs(password_cipher: str, key_id, password_plain: str) -> str:
    if password_cipher:
        return _require_rsa_and_decrypt(password_cipher, key_id, "password_cipher")
    if not password_plain:
        raise serializers.ValidationError({"password": _MSG_PASSWORD_REQUIRED})
    return password_plain


def _resolve_cipher_or_plain(
    cipher: str,
    plain: str,
    key_id,
    *,
    cipher_field: str,
    missing_error: dict,
) -> str:
    if cipher:
        return _require_rsa_and_decrypt(cipher, key_id, cipher_field)
    if plain:
        return plain
    raise serializers.ValidationError(missing_error)


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
        attrs["email"] = _resolve_email_from_inputs(email_cipher, key_id, email_plain)

        password_cipher = (attrs.pop("password_cipher", None) or "").strip()
        password_plain = (attrs.get("password") or "").strip()
        attrs["password"] = _resolve_password_from_inputs(password_cipher, key_id, password_plain)
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
        attrs["email"] = _resolve_email_from_inputs(email_cipher, key_id, email_plain)

        password_cipher = (attrs.pop("password_cipher", None) or "").strip()
        password_plain = (attrs.get("password") or "").strip()
        attrs["password"] = _resolve_password_from_inputs(password_cipher, key_id, password_plain)

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

        current_resolved = _resolve_cipher_or_plain(
            current_cipher,
            current_plain,
            key_id,
            cipher_field="current_password_cipher",
            missing_error={
                "current_password": "Indica la contraseña actual o envía current_password_cipher cifrado."
            },
        )
        new_resolved = _resolve_cipher_or_plain(
            new_cipher,
            new_plain,
            key_id,
            cipher_field="new_password_cipher",
            missing_error={
                "new_password": "Indica la nueva contraseña o envía new_password_cipher cifrado."
            },
        )
        new_resolved = _validate_password_policy(new_resolved)
        confirm_resolved = _resolve_cipher_or_plain(
            confirm_cipher,
            confirm_plain,
            key_id,
            cipher_field="confirm_password_cipher",
            missing_error={
                "confirm_password": "Indica la confirmación o envía confirm_password_cipher cifrado."
            },
        )

        if new_resolved != confirm_resolved:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})

        return {"current_password": current_resolved, "new_password": new_resolved}
