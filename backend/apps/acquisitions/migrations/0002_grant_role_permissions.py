from django.db import migrations

# Legal Officer runs due diligence, ownership verification and legal checks on
# acquisitions day to day, so they get full CRUD on the acquisition record and
# its child records (but not approval authority or deletion).
LEGAL_OFFICER_CODENAMES = [
    'view_landacquisition', 'add_landacquisition', 'change_landacquisition',
    'view_landowner', 'add_landowner', 'change_landowner',
    'view_negotiation', 'add_negotiation', 'change_negotiation',
    'view_purchasecost', 'add_purchasecost', 'change_purchasecost',
    'view_acquisitionattachment', 'add_acquisitionattachment', 'change_acquisitionattachment',
]

# Managing Director holds final approval authority over the acquisition
# workflow (approve / mark purchased / cancel / spawn project).
MANAGING_DIRECTOR_CODENAMES = ['view_landacquisition', 'approve_landacquisition']


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
        perms = Permission.objects.filter(content_type__app_label='acquisitions', codename__in=LEGAL_OFFICER_CODENAMES)
        legal_officer.permissions.add(*perms)

    try:
        managing_director = Role.objects.get(name='Managing Director')
    except Role.DoesNotExist:
        managing_director = None
    if managing_director:
        perms = Permission.objects.filter(
            content_type__app_label='acquisitions', codename__in=MANAGING_DIRECTOR_CODENAMES,
        )
        managing_director.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    try:
        legal_officer = Role.objects.get(name='Legal Officer')
    except Role.DoesNotExist:
        legal_officer = None
    if legal_officer:
        perms = Permission.objects.filter(content_type__app_label='acquisitions', codename__in=LEGAL_OFFICER_CODENAMES)
        legal_officer.permissions.remove(*perms)

    try:
        managing_director = Role.objects.get(name='Managing Director')
    except Role.DoesNotExist:
        managing_director = None
    if managing_director:
        perms = Permission.objects.filter(
            content_type__app_label='acquisitions', codename__in=MANAGING_DIRECTOR_CODENAMES,
        )
        managing_director.permissions.remove(*perms)


class Migration(migrations.Migration):

    dependencies = [
        ('acquisitions', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
