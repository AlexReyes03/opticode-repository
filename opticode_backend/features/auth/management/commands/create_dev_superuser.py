from django.core.management.base import BaseCommand

import environ

from features.auth.models import User

env = environ.Env()


class Command(BaseCommand):
    help = "Crea el superusuario de desarrollo para el equipo"

    def handle(self, *args, **options):
        email = env("DEV_ADMIN_EMAIL", default="admin@opticode.com")
        username = env("DEV_ADMIN_USERNAME", default="admin")
        password = env("DEV_SEED_PASSWORD", default="Admin123!")

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(
                f"El superusuario '{email}' ya existe."
            ))
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(
            f"Superusuario creado — email: {email} | password: {password}"
        ))
