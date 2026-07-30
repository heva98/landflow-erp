import django_filters

from .models import Reservation


class ReservationFilter(django_filters.FilterSet):
    class Meta:
        model = Reservation
        fields = ['plot', 'customer', 'status']
