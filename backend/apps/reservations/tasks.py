from celery import shared_task
from django.utils import timezone

from apps.plots.models import Plot

from .models import Reservation


@shared_task
def expire_overdue_reservations():
    overdue = Reservation.objects.filter(
        status=Reservation.Status.ACTIVE, expiry_date__lt=timezone.now(),
    )
    expired_count = 0
    for reservation in overdue:
        reservation.status = Reservation.Status.EXPIRED
        reservation.save(update_fields=['status', 'updated_at'])
        Plot.objects.filter(pk=reservation.plot_id, status=Plot.Status.RESERVED).update(status=Plot.Status.AVAILABLE)
        expired_count += 1
    return expired_count
