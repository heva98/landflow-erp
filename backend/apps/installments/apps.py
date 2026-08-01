from django.apps import AppConfig


class InstallmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.installments'
    label = 'installments'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Installment, InstallmentPayment, PaymentPlan

        register_for_audit(PaymentPlan)
        register_for_audit(Installment)
        register_for_audit(InstallmentPayment)
