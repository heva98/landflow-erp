import django_filters

from .models import Sale


class SaleFilter(django_filters.FilterSet):
    class Meta:
        model = Sale
        fields = ['plot', 'customer', 'reservation', 'sale_type', 'status']
