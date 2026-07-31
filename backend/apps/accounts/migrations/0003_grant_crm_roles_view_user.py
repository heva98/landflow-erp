from django.db import migrations

# Roles that manage the CRM lead pipeline need to see the user directory to
# assign leads to a sales agent/officer. Mirrors apps/crm's
# 0002_grant_crm_permissions FULL_ACCESS_ROLES plus Managing Director, who
# already has view-only CRM access for oversight.
VIEW_USER_ROLES = [
    'CRM Officer', 'Sales Agent', 'Sales Manager', 'Receptionist', 'Marketing Officer', 'Managing Director',
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

    view_user_perm = Permission.objects.get(content_type__app_label='accounts', codename='view_user')
    for role in Role.objects.filter(name__in=VIEW_USER_ROLES):
        role.permissions.add(view_user_perm)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    view_user_perm = Permission.objects.get(content_type__app_label='accounts', codename='view_user')
    for role in Role.objects.filter(name__in=VIEW_USER_ROLES):
        role.permissions.remove(view_user_perm)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
