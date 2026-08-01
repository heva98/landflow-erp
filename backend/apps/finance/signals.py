"""
Auto-posts an Income entry (see services.record_income) whenever a Sales
Receipt or an InstallmentPayment is created. Wired up here — from
finance/apps.py:ready() — rather than called explicitly from apps.sales /
apps.installments, so those modules stay unaware finance exists.
"""

from django.db.models.signals import post_save

from .models import Income


def connect():
    from apps.installments.models import InstallmentPayment
    from apps.sales.models import Receipt

    post_save.connect(_on_receipt_saved, sender=Receipt, dispatch_uid='finance.income_from_receipt')
    post_save.connect(
        _on_installment_payment_saved, sender=InstallmentPayment,
        dispatch_uid='finance.income_from_installment_payment',
    )


def _on_receipt_saved(sender, instance, created, **kwargs):
    if not created:
        return

    from . import services

    services.record_income(
        source=Income.Source.SALE,
        source_object=instance,
        amount=instance.amount,
        date=instance.received_at.date(),
        description=f'Receipt {instance.receipt_number} for sale {instance.sale.sale_number}',
        recorded_by=instance.issued_by,
    )


def _on_installment_payment_saved(sender, instance, created, **kwargs):
    if not created:
        return

    from . import services

    sale_number = instance.installment.payment_plan.sale.sale_number
    services.record_income(
        source=Income.Source.INSTALLMENT,
        source_object=instance,
        amount=instance.amount,
        date=instance.paid_at.date(),
        description=f'Installment payment {instance.receipt_number} ({sale_number})',
        recorded_by=instance.recorded_by,
    )
