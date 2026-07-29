from django.db import migrations

# Administrator has full_access and bypasses permission checks entirely.
FINANCIAL_ROLES = ['Managing Director', 'Finance Manager', 'Sales Manager']

# Everyone else who plausibly touches plots gets view-only access; Customer
# and Auditor are excluded — Auditor already has implicit read_only_all, and
# Customer isn't a staff role for this internal admin API.
VIEWER_ROLES = [
    'Sales Agent', 'Surveyor', 'Legal Officer', 'CRM Officer', 'Receptionist',
    'Marketing Officer', 'Cashier', 'Accountant', 'Document Officer', 'Site Manager',
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
        content_type__app_label='plots',
        codename__in=['add_plot', 'change_plot', 'delete_plot', 'view_plot', 'set_plot_financials'],
    )
    for role in Role.objects.filter(name__in=FINANCIAL_ROLES):
        role.permissions.add(*full_perms)

    view_perm = Permission.objects.get(content_type__app_label='plots', codename='view_plot')
    for role in Role.objects.filter(name__in=VIEWER_ROLES):
        role.permissions.add(view_perm)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    plot_perms = Permission.objects.filter(content_type__app_label='plots')
    for role in Role.objects.filter(name__in=FINANCIAL_ROLES + VIEWER_ROLES):
        role.permissions.remove(*plot_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('plots', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
