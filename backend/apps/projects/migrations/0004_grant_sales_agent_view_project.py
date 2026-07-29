from django.db import migrations


def grant_view_project(apps, schema_editor):
    # Custom/default model permissions are normally created by a post_migrate
    # signal, which hasn't fired yet mid-migration — create them explicitly
    # before granting one to a role.
    from django.apps import apps as global_apps
    from django.contrib.auth.management import create_permissions

    for app_config in global_apps.get_app_configs():
        create_permissions(app_config, verbosity=0)

    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    try:
        sales_agent = Role.objects.get(name='Sales Agent')
    except Role.DoesNotExist:
        return

    view_project = Permission.objects.get(content_type__app_label='projects', codename='view_project')
    sales_agent.permissions.add(view_project)


def revoke_view_project(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    try:
        sales_agent = Role.objects.get(name='Sales Agent')
    except Role.DoesNotExist:
        return

    view_project = Permission.objects.filter(content_type__app_label='projects', codename='view_project').first()
    if view_project:
        sales_agent.permissions.remove(view_project)


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_alter_project_options'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_view_project, revoke_view_project),
    ]
