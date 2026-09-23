from django.db import migrations

# Managing Director gets oversight (view) access to every admin surface.
VIEW_MODELS = ['currency', 'location', 'systemsetting', 'approvalworkflow', 'approvalstep', 'activitylog']
VIEW_ROLES = ['Managing Director']

# Finance owns exchange rates.
CURRENCY_MANAGER_ROLES = ['Finance Manager', 'Accountant']

# Managing Director also defines reference locations and approval policy.
MANAGE_MODELS = ['location', 'approvalworkflow', 'approvalstep']
MANAGE_ROLES = ['Managing Director']


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

    view_perms = Permission.objects.filter(
        content_type__app_label='administration', content_type__model__in=VIEW_MODELS, codename__startswith='view_',
    )
    for role in Role.objects.filter(name__in=VIEW_ROLES):
        role.permissions.add(*view_perms)

    manage_perms = Permission.objects.filter(
        content_type__app_label='administration',
        content_type__model__in=MANAGE_MODELS,
        codename__regex=r'^(add|change|view)_',
    )
    for role in Role.objects.filter(name__in=MANAGE_ROLES):
        role.permissions.add(*manage_perms)

    currency_perms = Permission.objects.filter(
        content_type__app_label='administration', content_type__model='currency', codename__regex=r'^(add|change|view)_',
    )
    for role in Role.objects.filter(name__in=CURRENCY_MANAGER_ROLES):
        role.permissions.add(*currency_perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    admin_perms = Permission.objects.filter(content_type__app_label='administration')
    affected_roles = set(VIEW_ROLES) | set(MANAGE_ROLES) | set(CURRENCY_MANAGER_ROLES)
    for role in Role.objects.filter(name__in=affected_roles):
        role.permissions.remove(*admin_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('administration', '0002_seed_base_currency'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
