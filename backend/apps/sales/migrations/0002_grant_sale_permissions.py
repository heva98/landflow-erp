from django.db import migrations

# Roles that create, cancel and process sales day to day.
FULL_ROLES = ['Managing Director', 'Sales Manager', 'Sales Agent', 'Cashier']

# Everyone else who plausibly needs to see sale records, view-only — Finance
# Manager and Accountant report on sales but don't originate them here.
VIEWER_ROLES = [
    'Finance Manager', 'Accountant', 'CRM Officer', 'Receptionist',
    'Surveyor', 'Legal Officer', 'Marketing Officer', 'Document Officer', 'Site Manager',
]

MODELS = ['sale', 'invoice', 'receipt']


def create_permissions_now():
    # Custom/default model permissions are normally created by a post_migrate
    # signal, which hasn't fired yet mid-migration — create them explicitly
    # before granting them to a role.
    from django.apps import apps as global_apps
    from django.contrib.auth.management import create_permissions

    for app_config in global_apps.get_app_configs():
        create_permissions(app_config, verbosity=0)


def grant_permissions(apps, schema_editor):
    create_permissions_now()

    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    full_perms = Permission.objects.filter(
        content_type__app_label='sales',
        content_type__model__in=MODELS,
        codename__regex=r'^(add|change|delete|view)_',
    )
    for role in Role.objects.filter(name__in=FULL_ROLES):
        role.permissions.add(*full_perms)

    view_perms = Permission.objects.filter(
        content_type__app_label='sales',
        content_type__model__in=MODELS,
        codename__startswith='view_',
    )
    for role in Role.objects.filter(name__in=VIEWER_ROLES):
        role.permissions.add(*view_perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    sale_perms = Permission.objects.filter(content_type__app_label='sales')
    for role in Role.objects.filter(name__in=FULL_ROLES + VIEWER_ROLES):
        role.permissions.remove(*sale_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
