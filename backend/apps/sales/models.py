import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.crm.models import Customer
from apps.plots.models import Plot
from apps.reservations.models import Reservation


def _generate_number(prefix):
    return f'{prefix}-{timezone.now():%Y%m}-{uuid.uuid4().hex[:8].upper()}'


class Sale(BaseModel):
    class SaleType(models.TextChoices):
        CASH = 'cash', 'Cash Sale'
        INSTALLMENT = 'installment', 'Installment Sale'
        CORPORATE = 'corporate', 'Corporate Sale'
        BULK = 'bulk', 'Bulk Purchase'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        CANCELLED = 'cancelled', 'Cancelled'

    sale_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    plot = models.ForeignKey(Plot, on_delete=models.PROTECT, related_name='sales')
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='sales')
    reservation = models.ForeignKey(
        Reservation, null=True, blank=True, on_delete=models.SET_NULL, related_name='sales',
    )
    sale_type = models.CharField(max_length=20, choices=SaleType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    # Financials — TZS.
    sale_price = models.DecimalField(max_digits=14, decimal_places=2)
    discount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    down_payment = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    sold_at = models.DateTimeField(default=timezone.now)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    sold_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='sales_made',
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-sold_at']
        constraints = [
            models.UniqueConstraint(
                fields=['plot'],
                condition=models.Q(status='active'),
                name='unique_active_sale_per_plot',
            ),
        ]

    def __str__(self):
        return f'{self.sale_number} - {self.plot} to {self.customer}'

    def save(self, *args, **kwargs):
        if not self.sale_number:
            self.sale_number = _generate_number('SALE')
        super().save(*args, **kwargs)

    @property
    def net_price(self):
        return self.sale_price - self.discount

    @property
    def balance_due(self):
        return self.net_price - self.down_payment


class Invoice(BaseModel):
    invoice_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    sale = models.OneToOneField(Sale, on_delete=models.CASCADE, related_name='invoice')

    amount = models.DecimalField(max_digits=14, decimal_places=2)
    issued_at = models.DateTimeField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)

    file = models.FileField(upload_to='invoices/%Y/%m/', blank=True, null=True)
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='invoices_issued',
    )

    class Meta:
        ordering = ['-issued_at']

    def __str__(self):
        return f'{self.invoice_number} for {self.sale.sale_number}'

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = _generate_number('INV')
        super().save(*args, **kwargs)


class Receipt(BaseModel):
    class PaymentMethod(models.TextChoices):
        CASH = 'cash', 'Cash'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
        MOBILE_MONEY = 'mobile_money', 'Mobile Money'
        CHEQUE = 'cheque', 'Cheque'

    receipt_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name='receipts')

    amount = models.DecimalField(max_digits=14, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    reference = models.CharField(max_length=100, blank=True)
    received_at = models.DateTimeField(default=timezone.now)

    file = models.FileField(upload_to='receipts/%Y/%m/', blank=True, null=True)
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='receipts_issued',
    )

    class Meta:
        ordering = ['-received_at']

    def __str__(self):
        return f'{self.receipt_number} for {self.sale.sale_number}'

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = _generate_number('RCT')
        super().save(*args, **kwargs)
