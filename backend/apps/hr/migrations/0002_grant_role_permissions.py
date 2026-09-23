from django.db import migrations

# Managing Director holds executive HR oversight — full day-to-day management
# of every HR model, plus final approval authority on leave requests (same
# "MD approves" pattern used across Acquisitions, Surveys and Legal).
MANAGING_DIRECTOR_CODENAMES = [
    'view_department', 'add_department', 'change_department',
    'view_employee', 'add_employee', 'change_employee',
    'view_attendance', 'add_attendance', 'change_attendance',
    'view_leavetype', 'add_leavetype', 'change_leavetype',
    'view_leaverequest', 'approve_leaverequest',
    'view_performancereview', 'add_performancereview', 'change_performancereview',
    'view_payrollrecord', 'add_payrollrecord', 'change_payrollrecord',
]

# Finance Manager owns payroll end to end — employee/attendance/leave data
# feeds the pay run, so they get read access to those plus full control of
# PayrollRecord itself.
FINANCE_MANAGER_CODENAMES = [
    'view_department', 'view_employee', 'view_attendance', 'view_leaverequest',
    'view_payrollrecord', 'add_payrollrecord', 'change_payrollrecord',
]

# Accountant processes the actual pay runs under the Finance Manager.
ACCOUNTANT_CODENAMES = [
    'view_employee', 'view_payrollrecord', 'add_payrollrecord', 'change_payrollrecord',
]

ROLE_CODENAMES = {
    'Managing Director': MANAGING_DIRECTOR_CODENAMES,
    'Finance Manager': FINANCE_MANAGER_CODENAMES,
    'Accountant': ACCOUNTANT_CODENAMES,
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
        perms = Permission.objects.filter(content_type__app_label='hr', codename__in=codenames)
        role.permissions.add(*perms)


def revoke_permissions(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Permission = apps.get_model('auth', 'Permission')

    hr_perms = Permission.objects.filter(content_type__app_label='hr')
    for role_name in ROLE_CODENAMES:
        try:
            role = Role.objects.get(name=role_name)
        except Role.DoesNotExist:
            continue
        role.permissions.remove(*hr_perms)


class Migration(migrations.Migration):

    dependencies = [
        ('hr', '0001_initial'),
        ('accounts', '0002_seed_roles'),
    ]

    operations = [
        migrations.RunPython(grant_permissions, revoke_permissions),
    ]
