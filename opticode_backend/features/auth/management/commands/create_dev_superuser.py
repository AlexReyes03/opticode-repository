from django.core.management.base import BaseCommand

from features.auth.models import User


class Command(BaseCommand):
    help = "Crea el superusuario de desarrollo para el equipo"

    def handle(self, *args, **options):
        email = "admin@opticode.com"
        username = "admin"
        password = "Admin123!"

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
