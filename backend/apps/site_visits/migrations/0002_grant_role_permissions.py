from django.db import migrations

# CRM Officer runs the whole site-visit operation end to end: booking leads
# in, logging feedback, and chasing follow-ups.
CRM_OFFICER_CODENAMES = [
    'view_driver', 'view_bus',
    'view_sitevisit', 'add_sitevisit', 'change_sitevisit',
    'view_sitevisitbooking', 'add_sitevisitbooking', 'change_sitevisitbooking',
    'view_visitfeedback', 'add_visitfeedback', 'change_visitfeedback',
    'view_visitphoto', 'add_visitphoto', 'change_visitphoto',
    'view_followup', 'add_followup', 'change_followup',
]

# Sales Agents book their own leads onto visits and handle the resulting
# feedback/follow-up, but don't manage transport logistics.
SALES_AGENT_CODENAMES = [
    'view_sitevisit',
    'view_sitevisitbooking', 'add_sitevisitbooking', 'change_sitevisitbooking',
    'view_visitfeedback', 'add_visitfeedback',
    'view_followup', 'add_followup', 'change_followup',
]

# Site Manager owns day-of logistics — scheduling the trip, allocating a bus
# and driver, and checking attendees in at the meeting point.
SITE_MANAGER_CODENAMES = [
    'view_driver', 'add_driver', 'change_driver',
    'view_bus', 'add_bus', 'change_bus',
    'view_sitevisit', 'add_sitevisit', 'change_sitevisit',
    'view_sitevisitbooking', 'add_sitevisitbooking', 'change_sitevisitbooking',
    'view_visitphoto', 'add_visitphoto',
]

ROLE_CODENAMES = {
    'CRM Officer': CRM_OFFICER_CODENAMES,
    'Sales Agent': SALES_AGENT_CODENAMES,
    'Site Manager': SITE_MANAGER_CODENAMES,
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
        perms = Permission.objects.filter(content_type__app_label='site_visits', codename__in=codenames)
        role.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    site_visit_perms = Permission.objects.filter(content_type__app_label='site_visits')
    for role_name in ROLE_CODENAMES:
        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            continue
        role.permissions.remove(*site_visit_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('site_visits', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
