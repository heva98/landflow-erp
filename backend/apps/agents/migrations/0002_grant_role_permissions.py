from django.db import migrations

# Managing Director holds final approval authority on commission payouts —
# same "MD approves" pattern used across Acquisitions, Surveys and Legal —
# plus full visibility into the whole agents program.
MANAGING_DIRECTOR_CODENAMES = [
    'view_territory', 'add_territory', 'change_territory',
    'view_commissionplan', 'add_commissionplan', 'change_commissionplan',
    'view_commissiontier', 'add_commissiontier', 'change_commissiontier',
    'view_agent', 'add_agent', 'change_agent',
    'view_salestarget', 'add_salestarget', 'change_salestarget',
    'view_commissionpayment', 'approve_commissionpayment',
]

# Sales Manager runs the agent sales force day to day: assigning territories
# and commission plans, setting targets, onboarding agents — but doesn't hold
# final sign-off on paying out commission.
SALES_MANAGER_CODENAMES = [
    'view_territory', 'add_territory', 'change_territory',
    'view_commissionplan', 'add_commissionplan', 'change_commissionplan',
    'view_commissiontier', 'add_commissiontier', 'change_commissiontier',
    'view_agent', 'add_agent', 'change_agent',
    'view_salestarget', 'add_salestarget', 'change_salestarget',
    'view_commissionpayment',
]

# Sales Agents see their own program context — territories, plans, targets
# and commission history — read-only.
SALES_AGENT_CODENAMES = [
    'view_territory', 'view_commissionplan', 'view_agent', 'view_salestarget', 'view_commissionpayment',
]

ROLE_CODENAMES = {
    'Managing Director': MANAGING_DIRECTOR_CODENAMES,
    'Sales Manager': SALES_MANAGER_CODENAMES,
    'Sales Agent': SALES_AGENT_CODENAMES,
}


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

    for role_name, codenames in ROLE_CODENAMES.items():
        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            continue
        perms = Permission.objects.filter(content_type__app_label='agents', codename__in=codenames)
        role.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    agents_perms = Permission.objects.filter(content_type__app_label='agents')
    for role_name in ROLE_CODENAMES:
        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            continue
        role.permissions.remove(*agents_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('agents', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
