from django.db import migrations

# Roles that actually work the lead pipeline and customer directory day to day.
FULL_ACCESS_ROLES = ['CRM Officer', 'Sales Agent', 'Sales Manager', 'Receptionist', 'Marketing Officer']

# Downstream/oversight roles that need to see CRM records (contracts, ledgers,
# reporting) without managing the pipeline themselves.
VIEWER_ROLES = ['Managing Director', 'Finance Manager', 'Legal Officer', 'Accountant', 'Cashier']

CRM_MODELS = ['organization', 'customer', 'lead', 'note', 'communicationlog']


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

    full_perms = Permission.objects.filter(content_type__app_label='crm', content_type__model__in=CRM_MODELS)
    for role in Role.objects.filter(name__in=FULL_ACCESS_ROLES):
        role.permissions.add(*full_perms)

    view_perms = Permission.objects.filter(
        content_type__app_label='crm', content_type__model__in=CRM_MODELS, codename__startswith='view_',
    )
    for role in Role.objects.filter(name__in=VIEWER_ROLES):
        role.permissions.add(*view_perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    crm_perms = Permission.objects.filter(content_type__app_label='crm')
    for role in Role.objects.filter(name__in=FULL_ACCESS_ROLES + VIEWER_ROLES):
        role.permissions.remove(*crm_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
