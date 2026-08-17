import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.hr.models import Employee


def _generate_agent_code():
    return f'AGT-{uuid.uuid4().hex[:8].upper()}'


class Territory(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    region = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Territories'

    def __str__(self):
        return self.name


class CommissionPlan(BaseModel):
    class PlanType(models.TextChoices):
        PERCENTAGE = 'percentage', 'Percentage of Sale'
        FLAT = 'flat', 'Flat Amount per Sale'
        TIERED = 'tiered', 'Tiered by Sale Amount'

    name = models.CharField(max_length=255, unique=True)
    plan_type = models.CharField(max_length=20, choices=PlanType.choices, default=PlanType.PERCENTAGE)
    # Used when plan_type == PERCENTAGE.
    rate_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    # Used when plan_type == FLAT.
    flat_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def calculate_commission(self, sale_amount):
        """sale_amount is a Sale's net_price (sale_price - discount)."""
        if not self.is_active or sale_amount is None:
            return Decimal('0.00')
        if self.plan_type == self.PlanType.PERCENTAGE:
            return (sale_amount * (self.rate_percent or Decimal('0')) / Decimal('100')).quantize(Decimal('0.01'))
        if self.plan_type == self.PlanType.FLAT:
            return self.flat_amount or Decimal('0.00')
        if self.plan_type == self.PlanType.TIERED:
            tier = (
                self.tiers.filter(min_amount__lte=sale_amount)
                .filter(models.Q(max_amount__isnull=True) | models.Q(max_amount__gte=sale_amount))
                .order_by('-min_amount')
                .first()
            )
            if not tier:
                return Decimal('0.00')
            return (sale_amount * tier.rate_percent / Decimal('100')).quantize(Decimal('0.01'))
        return Decimal('0.00')


class CommissionTier(BaseModel):
    plan = models.ForeignKey(CommissionPlan, on_delete=models.CASCADE, related_name='tiers')
    min_amount = models.DecimalField(max_digits=14, decimal_places=2)
    # Blank/null means "no upper bound" — the top tier.
    max_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    rate_percent = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        ordering = ['min_amount']

    def __str__(self):
        return f'{self.plan.name}: {self.min_amount}+ @ {self.rate_percent}%'


class Agent(BaseModel):
    # An agent IS an employee playing a sales role — no name/phone/email
    # duplicated here; all of that already lives on Employee.
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='agent_profile')
    agent_code = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    territory = models.ForeignKey(
        Territory, null=True, blank=True, on_delete=models.SET_NULL, related_name='agents',
    )
    commission_plan = models.ForeignKey(
        CommissionPlan, null=True, blank=True, on_delete=models.SET_NULL, related_name='agents',
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['agent_code']

    def __str__(self):
        return f'{self.agent_code} - {self.employee.full_name}'

    def save(self, *args, **kwargs):
        if not self.agent_code:
            self.agent_code = _generate_agent_code()
        super().save(*args, **kwargs)


class SalesTarget(BaseModel):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='sales_targets')
    period_start = models.DateField()
    period_end = models.DateField()
    target_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    target_plot_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-period_start']
        constraints = [
            models.UniqueConstraint(
                fields=['agent', 'period_start', 'period_end'], name='unique_target_per_agent_per_period',
            ),
        ]

    def __str__(self):
        return f'Target for {self.agent} ({self.period_start} to {self.period_end})'

    def _closed_sales_in_period(self):
        # Local import — apps.sales never needs to know apps.agents exists.
        from apps.sales.models import Sale

        if not self.agent.employee.user_id:
            return Sale.objects.none()
        return Sale.objects.filter(
            sold_by_id=self.agent.employee.user_id, status=Sale.Status.ACTIVE,
            sold_at__date__gte=self.period_start, sold_at__date__lte=self.period_end,
        )

    @property
    def achieved_amount(self):
        result = self._closed_sales_in_period().aggregate(total=models.Sum('sale_price'))
        return result['total'] or Decimal('0.00')

    @property
    def achieved_plot_count(self):
        return self._closed_sales_in_period().count()


class CommissionPayment(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        PAID = 'paid', 'Paid'
        CANCELLED = 'cancelled', 'Cancelled'

    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='commission_payments')
    # Null for manual/bonus commission entries not tied to one sale.
    sale = models.OneToOneField(
        'sales.Sale', null=True, blank=True, on_delete=models.CASCADE, related_name='commission_payment',
    )
    # Snapshot of the plan used, kept even if the plan is later edited/retired.
    commission_plan = models.ForeignKey(
        CommissionPlan, null=True, blank=True, on_delete=models.SET_NULL, related_name='commission_payments',
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    calculated_at = models.DateTimeField(default=timezone.now)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='commission_payments_approved',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-calculated_at']
        permissions = [
            ('approve_commissionpayment', 'Can approve or mark a commission payment as paid'),
        ]

    def __str__(self):
        return f'Commission for {self.agent} - {self.amount}'
