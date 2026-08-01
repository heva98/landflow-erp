from django.db import migrations

# Roles that manage the books day to day: chart of accounts, journals,
# income/expense recording, budgets.
FULL_ROLES = ['Managing Director', 'Finance Manager', 'Accountant']

# Cashier only handles the cash/bank side of things — income and expense
# entries and the accounts they move through, not journals or budgets.
CASHIER_MODELS = ['cashbankaccount', 'income', 'expense']

# Everyone else who plausibly needs to see financial standing, view-only.
VIEWER_ROLES = ['Administrator', 'Sales Manager']

MODELS = ['account', 'cashbankaccount', 'journalentry', 'journalline', 'income', 'expense', 'budget', 'budgetline']


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
        content_type__app_label='finance',
        content_type__model__in=MODELS,
        codename__regex=r'^(add|change|delete|view)_',
    )
    for role in Role.objects.filter(name__in=FULL_ROLES):
        role.permissions.add(*full_perms)

    cashier_perms = Permission.objects.filter(
        content_type__app_label='finance',
        content_type__model__in=CASHIER_MODELS,
        codename__regex=r'^(add|change|view)_',
    )
    for role in Role.objects.filter(name='Cashier'):
        role.permissions.add(*cashier_perms)

    view_perms = Permission.objects.filter(
        content_type__app_label='finance',
        content_type__model__in=MODELS,
        codename__startswith='view_',
    )
    for role in Role.objects.filter(name__in=VIEWER_ROLES):
        role.permissions.add(*view_perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    finance_perms = Permission.objects.filter(content_type__app_label='finance')
    for role in Role.objects.filter(name__in=FULL_ROLES + VIEWER_ROLES + ['Cashier']):
        role.permissions.remove(*finance_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
