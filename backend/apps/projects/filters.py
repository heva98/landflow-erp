import django_filters

from .models import Project


class ProjectFilter(django_filters.FilterSet):
    min_area = django_filters.NumberFilter(field_name='total_area_sqm', lookup_expr='gte')
    max_area = django_filters.NumberFilter(field_name='total_area_sqm', lookup_expr='lte')
    start_date_after = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_before = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')

    class Meta:
        model = Project
        fields = ['status', 'min_area', 'max_area', 'start_date_after', 'start_date_before']
