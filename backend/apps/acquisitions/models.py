import uuid

from django.conf import settings
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from apps.core.models import BaseModel
from apps.projects.models import Project


def _generate_reference():
    return f'ACQ-{timezone.now():%Y%m}-{uuid.uuid4().hex[:8].upper()}'


class LandAcquisition(BaseModel):
    class Status(models.TextChoices):
        POTENTIAL = 'potential', 'Potential'
        NEGOTIATING = 'negotiating', 'Negotiating'
        APPROVED = 'approved', 'Approved'
        PURCHASED = 'purchased', 'Purchased'
        CANCELLED = 'cancelled', 'Cancelled'

    reference_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.POTENTIAL)
    description = models.TextField(blank=True)

    # Location / GPS coordinates
    location = models.CharField(max_length=255)
    region = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    area_sqm = models.DecimalField(max_digits=14, decimal_places=2)

    # Due diligence / ownership verification / legal checks
    ownership_verified = models.BooleanField(default=False)
    legal_checks_passed = models.BooleanField(default=False)
    due_diligence_notes = models.TextField(blank=True)

    # Valuation
    valuation_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    valuation_date = models.DateField(null=True, blank=True)
    valuator_name = models.CharField(max_length=255, blank=True)

    # Pricing — TZS
    asking_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    purchase_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    purchased_at = models.DateField(null=True, blank=True)

    # Approval workflow
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='acquisitions_approved',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    # An approved acquisition can spawn a Project (spec Module 2).
    project = models.OneToOneField(
        Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='acquisition',
    )

    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='acquisitions_created',
    )

    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('approve_landacquisition', 'Can approve, mark purchased, or cancel a land acquisition'),
        ]

    def __str__(self):
        return f'{self.reference_number} - {self.name}'

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = _generate_reference()
        super().save(*args, **kwargs)

    @property
    def total_purchase_cost(self):
        extra = self.purchase_costs.aggregate(total=Sum('amount'))['total'] or 0
        return self.purchase_price + extra


class LandOwner(BaseModel):
    acquisition = models.ForeignKey(LandAcquisition, on_delete=models.CASCADE, related_name='owners')
    full_name = models.CharField(max_length=255)
    national_id = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    ownership_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=100)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name


class Negotiation(BaseModel):
    acquisition = models.ForeignKey(LandAcquisition, on_delete=models.CASCADE, related_name='negotiations')
    negotiated_on = models.DateField(default=timezone.now)
    offered_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    counter_offer_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    negotiated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='negotiations_logged',
    )

    class Meta:
        ordering = ['-negotiated_on', '-created_at']

    def __str__(self):
        return f'Negotiation for {self.acquisition} on {self.negotiated_on}'


class PurchaseCost(BaseModel):
    class CostType(models.TextChoices):
        LEGAL_FEES = 'legal_fees', 'Legal Fees'
        SURVEY_FEES = 'survey_fees', 'Survey Fees'
        AGENT_COMMISSION = 'agent_commission', 'Agent Commission'
        STAMP_DUTY = 'stamp_duty', 'Stamp Duty'
        TRANSFER_FEES = 'transfer_fees', 'Transfer Fees'
        OTHER = 'other', 'Other'

    acquisition = models.ForeignKey(LandAcquisition, on_delete=models.CASCADE, related_name='purchase_costs')
    cost_type = models.CharField(max_length=30, choices=CostType.choices)
    description = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    incurred_on = models.DateField(default=timezone.now)

    class Meta:
        ordering = ['-incurred_on']

    def __str__(self):
        return f'{self.get_cost_type_display()} - {self.amount}'


class AcquisitionAttachment(BaseModel):
    class DocumentType(models.TextChoices):
        TITLE_DEED = 'title_deed', 'Title Deed'
        SURVEY_MAP = 'survey_map', 'Survey Map'
        ID_COPY = 'id_copy', 'ID Copy'
        AGREEMENT = 'agreement', 'Agreement'
        VALUATION_REPORT = 'valuation_report', 'Valuation Report'
        OTHER = 'other', 'Other'

    acquisition = models.ForeignKey(LandAcquisition, on_delete=models.CASCADE, related_name='attachments')
    document_type = models.CharField(max_length=30, choices=DocumentType.choices, default=DocumentType.OTHER)
    file = models.FileField(upload_to='acquisitions/%Y/%m/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='acquisition_attachments',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_document_type_display()} for {self.acquisition}'
