from django.apps import AppConfig


class AdministrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.administration'
    label = 'administration'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import ApprovalStep, ApprovalWorkflow, Currency, Location, SystemSetting

        register_for_audit(Currency)
        register_for_audit(Location)
        register_for_audit(SystemSetting)
        register_for_audit(ApprovalWorkflow)
        register_for_audit(ApprovalStep)
