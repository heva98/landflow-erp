from django.db import migrations

VIEW_ROLES = ['Managing Director']


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

    view_role_perm = Permission.objects.get(content_type__app_label='accounts', codename='view_role')
    for role in Role.objects.filter(name__in=VIEW_ROLES):
        role.permissions.add(view_role_perm)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    view_role_perm = Permission.objects.get(content_type__app_label='accounts', codename='view_role')
    for role in Role.objects.filter(name__in=VIEW_ROLES):
        role.permissions.remove(view_role_perm)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_grant_crm_roles_view_user'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
