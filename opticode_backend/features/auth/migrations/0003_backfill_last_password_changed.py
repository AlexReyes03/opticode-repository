from django.db import migrations


def backfill_last_password_changed(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    users = User.objects.filter(last_password_changed__isnull=True)
    for user in users:
        user.last_password_changed = user.date_joined
    User.objects.bulk_update(users, ["last_password_changed"])


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0002_user_last_password_changed"),
    ]

    operations = [
        migrations.RunPython(
            backfill_last_password_changed,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
