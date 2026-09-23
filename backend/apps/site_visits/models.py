import io
import uuid

import qrcode
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.crm.models import Lead
from apps.projects.models import Project


def _generate_reference():
    return f'SV-{timezone.now():%Y%m}-{uuid.uuid4().hex[:8].upper()}'


def _generate_qr_code_file(token):
    # Encodes the bare token, not a URL — the frontend's check-in page
    # (built alongside the check-in endpoint) decides how to turn a scanned
    # token into a lookup, so the backend doesn't hardcode a frontend route.
    image = qrcode.make(token)
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return ContentFile(buffer.getvalue(), name=f'{token}.png')


class Driver(BaseModel):
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return self.full_name


class Bus(BaseModel):
    registration_number = models.CharField(max_length=30, unique=True)
    capacity = models.PositiveIntegerField()
    driver = models.ForeignKey(
        Driver, null=True, blank=True, on_delete=models.SET_NULL, related_name='buses',
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['registration_number']

    def __str__(self):
        return self.registration_number


class SiteVisit(BaseModel):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    reference_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    project = models.ForeignKey(Project, on_delete=models.PROTECT, related_name='site_visits')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)

    visit_date = models.DateField()
    departure_time = models.TimeField(null=True, blank=True)
    meeting_point = models.CharField(max_length=255, blank=True)

    # Transport / bus allocation
    bus = models.ForeignKey(Bus, null=True, blank=True, on_delete=models.SET_NULL, related_name='site_visits')

    notes = models.TextField(blank=True)
    organized_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='site_visits_organized',
    )

    class Meta:
        ordering = ['-visit_date']

    def __str__(self):
        return f'{self.reference_number} - {self.project.name} ({self.visit_date})'

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = _generate_reference()
        super().save(*args, **kwargs)


class SiteVisitBooking(BaseModel):
    class Status(models.TextChoices):
        BOOKED = 'booked', 'Booked'
        CONFIRMED = 'confirmed', 'Confirmed'
        CANCELLED = 'cancelled', 'Cancelled'
        NO_SHOW = 'no_show', 'No Show'

    site_visit = models.ForeignKey(SiteVisit, on_delete=models.CASCADE, related_name='bookings')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='site_visit_bookings')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.BOOKED)
    guest_count = models.PositiveIntegerField(default=1)

    # QR check-in / attendance — a booking is checked in exactly once, so
    # this lives directly on the booking rather than a separate model.
    qr_token = models.CharField(max_length=64, unique=True, editable=False, blank=True)
    qr_code = models.ImageField(upload_to='site_visits/qr_codes/', blank=True, editable=False)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='site_visit_checkins',
    )

    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['site_visit', 'lead'], name='unique_booking_per_lead_per_visit'),
        ]

    def __str__(self):
        return f'{self.lead.full_name} - {self.site_visit.reference_number}'

    def save(self, *args, **kwargs):
        if not self.qr_token:
            # id is already assigned at instantiation (BaseModel's UUID
            # default), so it's safe to use here even before the first save.
            self.qr_token = uuid.uuid4().hex
        if not self.qr_code:
            self.qr_code = _generate_qr_code_file(self.qr_token)
        super().save(*args, **kwargs)

    @property
    def is_checked_in(self):
        return self.checked_in_at is not None


class VisitFeedback(BaseModel):
    booking = models.OneToOneField(SiteVisitBooking, on_delete=models.CASCADE, related_name='feedback')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comments = models.TextField(blank=True)
    interested_in_purchasing = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f'Feedback from {self.booking.lead.full_name} ({self.rating}/5)'


class VisitPhoto(BaseModel):
    site_visit = models.ForeignKey(SiteVisit, on_delete=models.CASCADE, related_name='photos')
    file = models.ImageField(upload_to='site_visits/photos/%Y/%m/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='site_visit_photos_uploaded',
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Visit photos'

    def __str__(self):
        return f'Photo for {self.site_visit.reference_number}'


class FollowUp(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        DONE = 'done', 'Done'

    booking = models.ForeignKey(SiteVisitBooking, on_delete=models.CASCADE, related_name='follow_ups')
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='site_visit_follow_ups',
    )
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['due_date']
        verbose_name_plural = 'Follow-ups'

    def __str__(self):
        return f'Follow-up for {self.booking.lead.full_name} due {self.due_date}'
