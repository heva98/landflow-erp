from django.db import migrations

# Finance Manager and Sales Manager can now set plot financials (see the
# plots app) which requires being able to see which project a plot belongs to.
ROLES = ['Finance Manager', 'Sales Manager']


def grant_view_project(apps, schema_editor):
    from django.apps import apps as global_apps
    from django.contrib.auth.management import create_permissions

    for app_config in global_apps.get_app_configs():
        create_permissions(app_config, verbosity=0)

    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    view_project = Permission.objects.get(content_type__app_label='projects', codename='view_project')
    for role in Role.objects.filter(name__in=ROLES):
        role.permissions.add(view_project)


def revoke_view_project(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    view_project = Permission.objects.filter(content_type__app_label='projects', codename='view_project').first()
    if view_project:
        for role in Role.objects.filter(name__in=ROLES):
            role.permissions.remove(view_project)


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0006_grant_managing_director_edit_projects'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_view_project, revoke_view_project),
    ]
