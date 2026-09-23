from django.db import migrations

# Surveyors run the day-to-day field work: scheduling/running surveys, logging
# beacons, drafting subdivisions and their planned plots/roads/utilities, and
# uploading CAD/GIS documents. They do not hold approval authority.
SURVEYOR_CODENAMES = [
    'view_surveycompany',
    'view_surveyor', 'add_surveyor', 'change_surveyor',
    'view_survey', 'add_survey', 'change_survey',
    'view_beacon', 'add_beacon', 'change_beacon',
    'view_subdivision', 'add_subdivision', 'change_subdivision',
    'view_subdivisionplot', 'add_subdivisionplot', 'change_subdivisionplot',
    'view_roadreserve', 'add_roadreserve', 'change_roadreserve',
    'view_utilityreserve', 'add_utilityreserve', 'change_utilityreserve',
    'view_surveydocument', 'add_surveydocument', 'change_surveydocument',
]

# Managing Director holds final approval authority over surveys and
# subdivisions (approve/reject), same as the acquisitions workflow.
MANAGING_DIRECTOR_CODENAMES = ['view_survey', 'approve_survey', 'view_subdivision']


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
        surveyor_role = Role.objects.get(name='Surveyor')
    except Role.DoesNotExist:
        surveyor_role = None
    if surveyor_role:
        perms = Permission.objects.filter(content_type__app_label='surveys', codename__in=SURVEYOR_CODENAMES)
        surveyor_role.permissions.add(*perms)

    try:
        managing_director = Role.objects.get(name='Managing Director')
    except Role.DoesNotExist:
        managing_director = None
    if managing_director:
        perms = Permission.objects.filter(
            content_type__app_label='surveys', codename__in=MANAGING_DIRECTOR_CODENAMES,
        )
        managing_director.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    try:
        surveyor_role = Role.objects.get(name='Surveyor')
    except Role.DoesNotExist:
        surveyor_role = None
    if surveyor_role:
        perms = Permission.objects.filter(content_type__app_label='surveys', codename__in=SURVEYOR_CODENAMES)
        surveyor_role.permissions.remove(*perms)

    try:
        managing_director = Role.objects.get(name='Managing Director')
    except Role.DoesNotExist:
        managing_director = None
    if managing_director:
        perms = Permission.objects.filter(
            content_type__app_label='surveys', codename__in=MANAGING_DIRECTOR_CODENAMES,
        )
        managing_director.permissions.remove(*perms)


class Migration(migrations.Migration):

    dependencies = [
        ('surveys', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
