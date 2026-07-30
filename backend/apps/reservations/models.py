from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.crm.models import Customer
from apps.plots.models import Plot


class Reservation(BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        CONVERTED = 'converted', 'Converted'
        EXPIRED = 'expired', 'Expired'
        CANCELLED = 'cancelled', 'Cancelled'

    plot = models.ForeignKey(Plot, on_delete=models.PROTECT, related_name='reservations')
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='reservations')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    reservation_fee = models.DecimalField(max_digits=14, decimal_places=2)
    reserved_at = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateTimeField()

    converted_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    reserved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='reservations_made',
    )

    class Meta:
        ordering = ['-reserved_at']
        constraints = [
            models.UniqueConstraint(
                fields=['plot'],
                condition=models.Q(status='active'),
                name='unique_active_reservation_per_plot',
            ),
        ]

    def __str__(self):
        return f'{self.plot} reserved for {self.customer} ({self.get_status_display()})'

    @property
    def is_expired(self):
        return self.status == self.Status.ACTIVE and self.expiry_date < timezone.now()
