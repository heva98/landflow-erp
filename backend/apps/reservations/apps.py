from django.apps import AppConfig


class ReservationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reservations'
    label = 'reservations'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Reservation

        register_for_audit(Reservation)
