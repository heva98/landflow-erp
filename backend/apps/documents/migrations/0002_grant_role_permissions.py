from django.db import migrations

# Document Management is a shared utility every internal-facing module attaches
# files through, so every staff role gets add/change/view — Administrator
# already bypasses checks via full_access, Auditor already gets implicit view
# via read_only_all, and Customer is excluded (portal user, not this admin API).
STAFF_ROLES = [
    'Managing Director', 'Finance Manager', 'Sales Manager', 'Sales Agent', 'Surveyor',
    'Legal Officer', 'CRM Officer', 'Receptionist', 'Marketing Officer', 'Cashier',
    'Accountant', 'Document Officer', 'Site Manager',
]
STAFF_CODENAMES = [
    'view_document', 'add_document', 'change_document',
    'view_documentversion', 'add_documentversion',
]

# Document Officer additionally owns cleanup of the document store itself.
DOCUMENT_OFFICER_ONLY_CODENAMES = ['delete_document', 'delete_documentversion']


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

    staff_perms = Permission.objects.filter(content_type__app_label='documents', codename__in=STAFF_CODENAMES)
    for role in Role.objects.filter(name__in=STAFF_ROLES):
        role.permissions.add(*staff_perms)

    try:
        document_officer = Role.objects.get(name='Document Officer')
    except Role.DoesNotExist:
        document_officer = None
    if document_officer:
        perms = Permission.objects.filter(
            content_type__app_label='documents', codename__in=DOCUMENT_OFFICER_ONLY_CODENAMES,
        )
        document_officer.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    document_perms = Permission.objects.filter(content_type__app_label='documents')
    for role in Role.objects.filter(name__in=STAFF_ROLES):
        role.permissions.remove(*document_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
