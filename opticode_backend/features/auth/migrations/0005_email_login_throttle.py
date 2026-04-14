from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0004_user_created_by_user_updated_at_user_updated_by"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmailLoginThrottle",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email_normalized", models.EmailField(db_index=True, max_length=254, unique=True, verbose_name="correo normalizado")),
                ("failed_attempts", models.PositiveSmallIntegerField(default=0, verbose_name="intentos fallidos")),
                ("locked_until", models.DateTimeField(blank=True, null=True, verbose_name="bloqueado hasta")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="actualizado")),
            ],
            options={
                "verbose_name": "throttle de login por email",
                "verbose_name_plural": "throttles de login por email",
                "db_table": "auth_email_login_throttle",
            },
        ),
    ]
