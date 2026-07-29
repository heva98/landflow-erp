from django.db import migrations


def grant_permissions(apps, schema_editor):
    # Custom/default model permissions are normally created by a post_migrate
    # signal, which hasn't fired yet mid-migration — create them explicitly
    # before granting them to a role.
    from django.apps import apps as global_apps
    from django.contrib.auth.management import create_permissions

    for app_config in global_apps.get_app_configs():
        create_permissions(app_config, verbosity=0)

    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    try:
        managing_director = Role.objects.get(name='Managing Director')
    except Role.DoesNotExist:
        return

    perms = Permission.objects.filter(
        content_type__app_label='projects', codename__in=['view_project', 'change_project'],
    )
    managing_director.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    try:
        managing_director = Role.objects.get(name='Managing Director')
    except Role.DoesNotExist:
        return

    perms = Permission.objects.filter(
        content_type__app_label='projects', codename__in=['view_project', 'change_project'],
    )
    managing_director.permissions.remove(*perms)


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_remove_project_owner'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
