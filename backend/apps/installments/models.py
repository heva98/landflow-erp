import uuid
from decimal import ROUND_DOWN, Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.sales.models import Sale


def _generate_number(prefix):
    return f'{prefix}-{timezone.now():%Y%m}-{uuid.uuid4().hex[:8].upper()}'


def _add_months(date, months):
    month_index = date.month - 1 + months
    year = date.year + month_index // 12
    month = month_index % 12 + 1
    day = min(date.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28,
                         31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
    return date.replace(year=year, month=month, day=day)


class PaymentPlan(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        DEFAULTED = 'defaulted', 'Defaulted'
        CANCELLED = 'cancelled', 'Cancelled'

    sale = models.OneToOneField(Sale, on_delete=models.PROTECT, related_name='payment_plan')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    # Financials — TZS. `principal_amount` is what's actually financed, i.e.
    # the sale's net price minus the down payment already recorded on Sale.
    principal_amount = models.DecimalField(max_digits=14, decimal_places=2)
    interest_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text='Flat percentage charged over the full term, applied to principal_amount.',
    )
    number_of_installments = models.PositiveIntegerField()
    installment_amount = models.DecimalField(
        max_digits=14, decimal_places=2,
        help_text='Regular monthly installment amount; the final installment absorbs any rounding remainder.',
    )

    start_date = models.DateField(help_text='Due date of the first installment.')
    grace_period_days = models.PositiveIntegerField(
        default=0, help_text='Days after due_date before an unpaid installment is considered overdue.',
    )
    penalty_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text="Percentage of an installment's amount_due charged as a one-time penalty once overdue.",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='payment_plans_created',
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Payment plan for {self.sale.sale_number}'

    @property
    def total_payable(self):
        return self.principal_amount + (self.principal_amount * self.interest_rate / 100)

    @property
    def amount_paid(self):
        return self.installments.aggregate(total=models.Sum('amount_paid'))['total'] or Decimal('0')

    @property
    def outstanding_balance(self):
        totals = self.installments.aggregate(
            due=models.Sum('amount_due'), penalty=models.Sum('penalty_amount'), paid=models.Sum('amount_paid'),
        )
        due = totals['due'] or Decimal('0')
        penalty = totals['penalty'] or Decimal('0')
        paid = totals['paid'] or Decimal('0')
        return due + penalty - paid

    def generate_schedule(self):
        """
        Build the monthly Installment rows for this plan. Called once, right
        after the plan is created — the schedule is fixed at creation time and
        not regenerated if principal/rate/term are edited later.
        """
        if self.installments.exists():
            raise ValueError('Schedule already generated for this payment plan.')

        total_payable = self.total_payable
        per_installment = (total_payable / self.number_of_installments).quantize(
            Decimal('0.01'), rounding=ROUND_DOWN,
        )
        remainder = total_payable - (per_installment * self.number_of_installments)

        installments = [
            Installment(
                payment_plan=self,
                sequence=sequence,
                due_date=_add_months(self.start_date, sequence - 1),
                amount_due=per_installment + remainder if sequence == self.number_of_installments else per_installment,
            )
            for sequence in range(1, self.number_of_installments + 1)
        ]
        Installment.objects.bulk_create(installments)


class Installment(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PARTIAL = 'partial', 'Partially Paid'
        PAID = 'paid', 'Paid'
        OVERDUE = 'overdue', 'Overdue'

    payment_plan = models.ForeignKey(PaymentPlan, on_delete=models.CASCADE, related_name='installments')
    sequence = models.PositiveIntegerField(help_text='1-based position of this installment within the plan.')
    due_date = models.DateField()

    amount_due = models.DecimalField(max_digits=14, decimal_places=2)
    penalty_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    paid_at = models.DateTimeField(null=True, blank=True)
    flagged_overdue_at = models.DateTimeField(
        null=True, blank=True, help_text='Set once by the overdue-flagging task, to avoid re-charging the penalty.',
    )

    class Meta:
        ordering = ['payment_plan', 'sequence']
        constraints = [
            models.UniqueConstraint(fields=['payment_plan', 'sequence'], name='unique_installment_sequence_per_plan'),
        ]

    def __str__(self):
        return f'Installment {self.sequence} of {self.payment_plan} due {self.due_date}'

    @property
    def balance(self):
        return self.amount_due + self.penalty_amount - self.amount_paid


class InstallmentPayment(BaseModel):
    class Method(models.TextChoices):
        CASH = 'cash', 'Cash'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
        MOBILE_MONEY = 'mobile_money', 'Mobile Money'
        CHEQUE = 'cheque', 'Cheque'

    receipt_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    installment = models.ForeignKey(Installment, on_delete=models.PROTECT, related_name='payments')

    amount = models.DecimalField(max_digits=14, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices)
    reference = models.CharField(max_length=100, blank=True)
    paid_at = models.DateTimeField(default=timezone.now)

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='installment_payments_recorded',
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-paid_at']

    def __str__(self):
        return f'{self.receipt_number} for {self.installment}'

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = _generate_number('IPMT')
        super().save(*args, **kwargs)
