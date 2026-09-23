from django.db import migrations


def seed_base_currency(apps, schema_editor):
    Currency = apps.get_model('administration', 'Currency')
    Currency.objects.get_or_create(
        code='TZS', defaults={'name': 'Tanzanian Shilling', 'symbol': 'TSh', 'is_base': True},
    )


def unseed_base_currency(apps, schema_editor):
    Currency = apps.get_model('administration', 'Currency')
    Currency.objects.filter(code='TZS', is_base=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_base_currency, unseed_base_currency),
    ]
