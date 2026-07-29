from django.apps import AppConfig


class CrmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.crm'
    label = 'crm'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import CommunicationLog, Customer, Lead, Note, Organization

        register_for_audit(Organization)
        register_for_audit(Customer)
        register_for_audit(Lead)
        register_for_audit(Note)
        register_for_audit(CommunicationLog)
