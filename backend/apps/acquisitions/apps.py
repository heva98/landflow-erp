from django.apps import AppConfig


class AcquisitionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.acquisitions'
    label = 'acquisitions'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import AcquisitionAttachment, LandAcquisition, LandOwner, Negotiation, PurchaseCost

        register_for_audit(LandAcquisition)
        register_for_audit(LandOwner)
        register_for_audit(Negotiation)
        register_for_audit(PurchaseCost)
        register_for_audit(AcquisitionAttachment)
