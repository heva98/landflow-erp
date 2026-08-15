from django.apps import AppConfig


class LegalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.legal'
    label = 'legal'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import (
            Contract, DocumentTemplate, OwnershipTransfer, PowerOfAttorney, SaleAgreement, TitleDeed, Witness,
        )

        register_for_audit(SaleAgreement)
        register_for_audit(TitleDeed)
        register_for_audit(PowerOfAttorney)
        register_for_audit(Contract)
        register_for_audit(OwnershipTransfer)
        register_for_audit(Witness)
        register_for_audit(DocumentTemplate)
