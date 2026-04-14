"""RSA-OAEP (SHA-256) alineado con el cliente (Web Crypto o node-forge, mismo padding)."""

from __future__ import annotations

import base64

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from django.conf import settings


def rsa_configured() -> bool:
    return bool(getattr(settings, "AUTH_RSA_PRIVATE_KEY", "").strip())


def _load_private_key() -> rsa.RSAPrivateKey | None:
    pem = getattr(settings, "AUTH_RSA_PRIVATE_KEY", "") or ""
    pem = pem.strip()
    if not pem:
        return None
    key = serialization.load_pem_private_key(
        pem.encode("utf-8"),
        password=None,
    )
    if not isinstance(key, rsa.RSAPrivateKey):
        raise TypeError("La clave PEM debe ser RSA.")
    return key


def public_key_bundle() -> dict | None:
    """
    Si hay clave privada configurada, devuelve PEM SPKI y key_id.
    Si no, None (el endpoint expone enabled: false).
    """
    private = _load_private_key()
    if private is None:
        return None
    pub_pem = (
        private.public_key()
        .public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        .decode("utf-8")
    )
    return {
        "enabled": True,
        "public_key_pem": pub_pem,
        "key_id": getattr(settings, "AUTH_RSA_KEY_ID", "v1"),
    }


def decrypt_oaep_b64(b64_ciphertext: str, key_id: str | None) -> str:
    """
    Descifra Base64(RSA-OAEP-SHA256) y devuelve texto UTF-8 (contraseña en claro, solo en memoria).
    """
    if not rsa_configured():
        raise ValueError("El cifrado de contraseña no está activo en el servidor.")
    expected = getattr(settings, "AUTH_RSA_KEY_ID", "v1")
    if key_id and str(key_id).strip() and str(key_id).strip() != str(expected):
        raise ValueError("Identificador de clave no válido.")
    private = _load_private_key()
    if private is None:
        raise ValueError("Clave RSA no disponible.")
    try:
        raw = base64.b64decode(b64_ciphertext, validate=True)
    except (ValueError, TypeError) as exc:
        raise ValueError("password_cipher no es Base64 válido.") from exc
    try:
        plain = private.decrypt(
            raw,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
    except Exception as exc:
        raise ValueError("No se pudo descifrar la contraseña.") from exc
    try:
        return plain.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError("Contraseña descifrada no es UTF-8 válido.") from exc
