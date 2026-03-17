import environ

env = environ.Env()

DJANGO_ENV = env("DJANGO_ENV", default="development")

if DJANGO_ENV == "production":
    from config.settings.production import *  # noqa: F401,F403
else:
    from config.settings.development import *  # noqa: F401,F403
