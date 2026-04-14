from datetime import timedelta
from pathlib import Path

import environ
from django.core.exceptions import ImproperlyConfigured
from corsheaders.defaults import default_headers  # noqa: F401

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")


def _resolve_auth_rsa_private_key() -> str:
    """
    PEM desde AUTH_RSA_PRIVATE_KEY_FILE (ruta relativa a BASE_DIR o absoluta)
    o, si está vacío, desde AUTH_RSA_PRIVATE_KEY (una línea con \\n).
    """
    key_file = env.str("AUTH_RSA_PRIVATE_KEY_FILE", default="").strip()
    if key_file:
        path = Path(key_file).expanduser()
        if not path.is_absolute():
            path = BASE_DIR / path
        try:
            pem = path.read_text(encoding="utf-8")
        except OSError as exc:
            raise ImproperlyConfigured(
                f"No se pudo leer AUTH_RSA_PRIVATE_KEY_FILE ({path}): {exc}"
            ) from exc
        return pem.strip()
    return env.str("AUTH_RSA_PRIVATE_KEY", default="").replace("\\n", "\n")


SECRET_KEY = env("SECRET_KEY")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["*"])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    # Local — features
    "features.auth",
    "features.users",
    "features.projects",
    "features.audit",
    "auditlog",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "auditlog.middleware.AuditLogMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:5173"])

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

# Configuración para archivos subidos (momentaneo hasta creacion de S3)
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "authentication.User"

JWT_ENABLED = env.bool("JWT_ENABLED", default=True)

# Cifrado opcional de contraseñas en login/registro (RSA-OAEP SHA-256).
# Ver _resolve_auth_rsa_private_key: archivo PEM o PEM en una línea; vacío = solo texto plano.
AUTH_RSA_PRIVATE_KEY = _resolve_auth_rsa_private_key()
AUTH_RSA_KEY_ID = env.str("AUTH_RSA_KEY_ID", default="v1")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        ["rest_framework_simplejwt.authentication.JWTAuthentication"]
        if JWT_ENABLED
        else []
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        ["rest_framework.permissions.IsAuthenticated"]
        if JWT_ENABLED
        else ["rest_framework.permissions.AllowAny"]
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(hours=24),
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

