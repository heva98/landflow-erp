from django.apps import AppConfig


class AgentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.agents'
    label = 'agents'

    def ready(self):
        from django.db.models.signals import post_save

        from apps.core.audit import register_for_audit
        from apps.sales.models import Sale

        from .models import Agent, CommissionPayment, CommissionPlan, CommissionTier, SalesTarget, Territory
        from .signals import calculate_commission_on_sale

        register_for_audit(Territory)
        register_for_audit(CommissionPlan)
        register_for_audit(CommissionTier)
        register_for_audit(Agent)
        register_for_audit(SalesTarget)
        register_for_audit(CommissionPayment)

        post_save.connect(
            calculate_commission_on_sale, sender=Sale, dispatch_uid='agents.calculate_commission_on_sale',
        )
