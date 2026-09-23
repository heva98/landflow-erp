from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.core.models import BaseModel


class Currency(BaseModel):
    code = models.CharField(max_length=3, unique=True, help_text='ISO 4217 code, e.g. TZS, USD.')
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=8, blank=True)
    # Units of this currency per one unit of the base currency.
    exchange_rate = models.DecimalField(max_digits=18, decimal_places=6, default=1)
    is_base = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        if self.is_base:
            Currency.objects.exclude(pk=self.pk).update(is_base=False)
        super().save(*args, **kwargs)


class Location(BaseModel):
    class LocationType(models.TextChoices):
        REGION = 'region', 'Region'
        DISTRICT = 'district', 'District'
        WARD = 'ward', 'Ward'

    name = models.CharField(max_length=150)
    location_type = models.CharField(max_length=20, choices=LocationType.choices)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name='children',
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['location_type', 'name']
        constraints = [
            models.UniqueConstraint(fields=['name', 'location_type', 'parent'], name='unique_location_per_parent'),
        ]

    def __str__(self):
        return self.name


class SystemSetting(BaseModel):
    company_name = models.CharField(max_length=255, default='LandFlow')
    company_address = models.CharField(max_length=255, blank=True)
    company_phone = models.CharField(max_length=30, blank=True)
    company_email = models.EmailField(blank=True)
    base_currency = models.ForeignKey(
        Currency, null=True, blank=True, on_delete=models.SET_NULL, related_name='+',
    )
    date_format = models.CharField(max_length=20, default='DD/MM/YYYY')
    timezone = models.CharField(max_length=50, default='Africa/Dar_es_Salaam')
    fiscal_year_start_month = models.PositiveSmallIntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(12)],
    )

    def __str__(self):
        return 'System settings'

    @classmethod
    def load(cls):
        obj = cls.objects.first()
        if obj is None:
            obj = cls.objects.create()
        return obj


class ApprovalWorkflow(BaseModel):
    class WorkflowType(models.TextChoices):
        LAND_ACQUISITION = 'land_acquisition', 'Land Acquisition'
        SURVEY = 'survey', 'Survey'
        SUBDIVISION = 'subdivision', 'Subdivision'
        SALE_AGREEMENT = 'sale_agreement', 'Sale Agreement'
        TITLE_DEED = 'title_deed', 'Title Deed'
        POWER_OF_ATTORNEY = 'power_of_attorney', 'Power of Attorney'
        OWNERSHIP_TRANSFER = 'ownership_transfer', 'Ownership Transfer'
        EXPENSE = 'expense', 'Expense'
        OTHER = 'other', 'Other'

    name = models.CharField(max_length=150)
    workflow_type = models.CharField(max_length=30, choices=WorkflowType.choices)
    description = models.TextField(blank=True)
    # Steps only apply once the record's amount reaches this threshold, if set.
    min_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['workflow_type', 'name']

    def __str__(self):
        return self.name


class ApprovalStep(BaseModel):
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE, related_name='steps')
    order = models.PositiveSmallIntegerField()
    role = models.ForeignKey('accounts.Role', on_delete=models.PROTECT, related_name='approval_steps')
    name = models.CharField(max_length=150, blank=True)

    class Meta:
        ordering = ['workflow', 'order']
        constraints = [
            models.UniqueConstraint(fields=['workflow', 'order'], name='unique_step_order_per_workflow'),
        ]

    def __str__(self):
        return f'{self.workflow.name} — step {self.order} ({self.role.name})'


class ActivityLog(BaseModel):
    class Action(models.TextChoices):
        LOGIN = 'login', 'Login'
        LOGIN_FAILED = 'login_failed', 'Login Failed'
        LOGOUT = 'logout', 'Logout'

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='activity_logs',
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    description = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_action_display()} - {self.actor or "unknown"}'

    def delete(self, *args, **kwargs):
        raise ValueError('ActivityLog entries are immutable and cannot be deleted.')
