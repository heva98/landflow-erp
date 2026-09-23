import django_filters

from .models import AuditLog


class AuditLogFilter(django_filters.FilterSet):
    content_type = django_filters.CharFilter(field_name='content_type__model', lookup_expr='iexact')
    date_from = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    date_to = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

    class Meta:
        model = AuditLog
        fields = ['action', 'actor', 'content_type', 'date_from', 'date_to']
