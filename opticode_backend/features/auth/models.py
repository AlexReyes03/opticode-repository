from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField("correo electrónico", unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "usuarios"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return self.email
