from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q
from django.utils import timezone

from apps.core.models import BaseModel
from apps.projects.models import Project

# Note and CommunicationLog can attach to any of these CRM entities.
CRM_TARGET_MODELS = ('lead', 'customer', 'organization')


class Organization(BaseModel):
    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, blank=True)
    tin = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Customer(BaseModel):
    class CustomerType(models.TextChoices):
        INDIVIDUAL = 'individual', 'Individual'
        ORGANIZATION = 'organization', 'Organization'

    customer_type = models.CharField(
        max_length=20, choices=CustomerType.choices, default=CustomerType.INDIVIDUAL,
    )
    full_name = models.CharField(max_length=255)
    organization = models.ForeignKey(
        Organization, null=True, blank=True, on_delete=models.SET_NULL, related_name='customers',
    )
    phone = models.CharField(max_length=30, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    address = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name


class Lead(BaseModel):
    class Source(models.TextChoices):
        FACEBOOK = 'facebook', 'Facebook'
        INSTAGRAM = 'instagram', 'Instagram'
        TIKTOK = 'tiktok', 'TikTok'
        WEBSITE = 'website', 'Website'
        REFERRAL = 'referral', 'Referral'
        BILLBOARD = 'billboard', 'Billboard'
        WALK_IN = 'walk_in', 'Walk-in'

    class Status(models.TextChoices):
        NEW = 'new', 'New'
        CONTACTED = 'contacted', 'Contacted'
        INTERESTED = 'interested', 'Interested'
        SITE_VISIT = 'site_visit', 'Site Visit'
        NEGOTIATING = 'negotiating', 'Negotiating'
        RESERVED = 'reserved', 'Reserved'
        PURCHASED = 'purchased', 'Purchased'
        LOST = 'lost', 'Lost'

    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    source = models.CharField(max_length=20, choices=Source.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    lost_reason = models.TextField(blank=True)

    organization = models.ForeignKey(
        Organization, null=True, blank=True, on_delete=models.SET_NULL, related_name='leads',
    )
    interested_project = models.ForeignKey(
        Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='leads',
    )
    referred_by = models.ForeignKey(
        Customer, null=True, blank=True, on_delete=models.SET_NULL, related_name='referrals',
        help_text='Existing customer who referred this lead.',
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='assigned_leads',
    )
    converted_customer = models.OneToOneField(
        Customer, null=True, blank=True, on_delete=models.SET_NULL, related_name='source_lead',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} ({self.get_status_display()})'


class Note(BaseModel):
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE,
        limit_choices_to=Q(app_label='crm', model__in=CRM_TARGET_MODELS),
    )
    object_id = models.UUIDField()
    target = GenericForeignKey('content_type', 'object_id')

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='crm_notes',
    )
    body = models.TextField()

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['content_type', 'object_id'])]

    def __str__(self):
        return f'Note on {self.content_type.model} #{self.object_id}'


class CommunicationLog(BaseModel):
    class Channel(models.TextChoices):
        CALL = 'call', 'Call'
        WHATSAPP = 'whatsapp', 'WhatsApp'
        SMS = 'sms', 'SMS'
        EMAIL = 'email', 'Email'

    class Direction(models.TextChoices):
        INBOUND = 'inbound', 'Inbound'
        OUTBOUND = 'outbound', 'Outbound'

    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE,
        limit_choices_to=Q(app_label='crm', model__in=CRM_TARGET_MODELS),
    )
    object_id = models.UUIDField()
    target = GenericForeignKey('content_type', 'object_id')

    channel = models.CharField(max_length=20, choices=Channel.choices)
    direction = models.CharField(max_length=20, choices=Direction.choices)
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)
    occurred_at = models.DateTimeField(default=timezone.now)
    logged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name='crm_communications',
    )

    class Meta:
        ordering = ['-occurred_at']
        indexes = [models.Index(fields=['content_type', 'object_id'])]

    def __str__(self):
        return f'{self.get_channel_display()} with {self.content_type.model} #{self.object_id}'
