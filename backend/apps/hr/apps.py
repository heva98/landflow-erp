from django.apps import AppConfig


class HrConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.hr'
    label = 'hr'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Attendance, Department, Employee, LeaveRequest, LeaveType, PayrollRecord, PerformanceReview

        register_for_audit(Department)
        register_for_audit(Employee)
        register_for_audit(Attendance)
        register_for_audit(LeaveType)
        register_for_audit(LeaveRequest)
        register_for_audit(PerformanceReview)
        register_for_audit(PayrollRecord)
