from django.apps import AppConfig


class SalesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.sales'
    label = 'sales'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Invoice, Receipt, Sale

        register_for_audit(Sale)
        register_for_audit(Invoice)
        register_for_audit(Receipt)
