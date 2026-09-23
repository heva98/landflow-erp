from django.db import migrations

# Legal Officer runs the day-to-day legal work: drafting agreements, tracking
# title deeds through the registry, recording powers of attorney, contracts
# and witnesses, and requesting ownership transfers — but not final approval
# authority over any of them.
LEGAL_OFFICER_CODENAMES = [
    'view_saleagreement', 'add_saleagreement', 'change_saleagreement',
    'view_titledeed', 'add_titledeed', 'change_titledeed',
    'view_powerofattorney', 'add_powerofattorney', 'change_powerofattorney',
    'view_contract', 'add_contract', 'change_contract',
    'view_ownershiptransfer', 'add_ownershiptransfer', 'change_ownershiptransfer',
    'view_witness', 'add_witness', 'change_witness',
    'view_documenttemplate', 'add_documenttemplate', 'change_documenttemplate',
]

# Managing Director holds final approval authority across every gated legal
# workflow (sale agreements, title deeds, powers of attorney, ownership
# transfers) — same role as in the acquisitions and surveys workflows.
MANAGING_DIRECTOR_CODENAMES = [
    'view_saleagreement', 'approve_saleagreement',
    'view_titledeed', 'approve_titledeed',
    'view_powerofattorney', 'approve_powerofattorney',
    'view_ownershiptransfer', 'approve_ownershiptransfer',
]


def grant_permissions(apps, schema_editor):
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
        legal_officer = Role.objects.get(name='Legal Officer')
    except Role.DoesNotExist:
        legal_officer = None
    if legal_officer:
        perms = Permission.objects.filter(content_type__app_label='legal', codename__in=LEGAL_OFFICER_CODENAMES)
        legal_officer.permissions.add(*perms)

    try:
        managing_director = Role.objects.get(name='Managing Director')
    except Role.DoesNotExist:
        managing_director = None
    if managing_director:
        perms = Permission.objects.filter(
            content_type__app_label='legal', codename__in=MANAGING_DIRECTOR_CODENAMES,
        )
        managing_director.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    legal_perms = Permission.objects.filter(content_type__app_label='legal')
    for role_name in ('Legal Officer', 'Managing Director'):
        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            continue
        role.permissions.remove(*legal_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('legal', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
