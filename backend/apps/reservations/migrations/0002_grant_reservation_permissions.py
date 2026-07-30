from django.db import migrations

# Roles that take, convert and cancel reservations day to day.
FULL_ROLES = ['Managing Director', 'Sales Manager', 'Sales Agent', 'CRM Officer', 'Receptionist']

# Everyone else who plausibly needs to see reservation status, view-only.
VIEWER_ROLES = [
    'Finance Manager', 'Accountant', 'Cashier', 'Legal Officer',
    'Surveyor', 'Site Manager', 'Marketing Officer', 'Document Officer',
]


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
        content_type__app_label='reservations',
        codename__in=['add_reservation', 'change_reservation', 'delete_reservation', 'view_reservation'],
    )
    for role in Role.objects.filter(name__in=FULL_ROLES):
        role.permissions.add(*full_perms)

    view_perm = Permission.objects.get(content_type__app_label='reservations', codename='view_reservation')
    for role in Role.objects.filter(name__in=VIEWER_ROLES):
        role.permissions.add(view_perm)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    reservation_perms = Permission.objects.filter(content_type__app_label='reservations')
    for role in Role.objects.filter(name__in=FULL_ROLES + VIEWER_ROLES):
        role.permissions.remove(*reservation_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
