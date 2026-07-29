from django.db import migrations

# name, full_access, read_only_all — per docs/spec.md "User Roles"
ROLES = [
    ('Administrator', True, False),
    ('Managing Director', False, False),
    ('Finance Manager', False, False),
    ('Sales Manager', False, False),
    ('Sales Agent', False, False),
    ('Surveyor', False, False),
    ('Legal Officer', False, False),
    ('CRM Officer', False, False),
    ('Receptionist', False, False),
    ('Marketing Officer', False, False),
    ('Cashier', False, False),
    ('Accountant', False, False),
    ('Document Officer', False, False),
    ('Site Manager', False, False),
    ('Customer', False, False),
    ('Auditor', False, True),
]


def seed_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    for name, full_access, read_only_all in ROLES:
        Role.objects.get_or_create(
            name=name,
            defaults={'full_access': full_access, 'read_only_all': read_only_all},
        )


def unseed_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Role.objects.filter(name__in=[name for name, _, _ in ROLES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_roles, unseed_roles),
    ]
