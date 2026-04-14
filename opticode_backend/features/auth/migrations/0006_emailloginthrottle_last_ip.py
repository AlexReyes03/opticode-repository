from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0005_email_login_throttle"),
    ]

    operations = [
        migrations.AddField(
            model_name="emailloginthrottle",
            name="last_ip",
            field=models.CharField(
                blank=True,
                max_length=45,
                null=True,
                verbose_name="última IP de intento",
            ),
        ),
    ]
