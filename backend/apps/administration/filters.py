import django_filters

from .models import ActivityLog, ApprovalStep, ApprovalWorkflow, Currency, Location


class CurrencyFilter(django_filters.FilterSet):
    class Meta:
        model = Currency
        fields = ['is_active', 'is_base']


class LocationFilter(django_filters.FilterSet):
    class Meta:
        model = Location
        fields = ['location_type', 'parent', 'is_active']


class ApprovalWorkflowFilter(django_filters.FilterSet):
    class Meta:
        model = ApprovalWorkflow
        fields = ['workflow_type', 'is_active']


class ApprovalStepFilter(django_filters.FilterSet):
    class Meta:
        model = ApprovalStep
        fields = ['workflow', 'role']


class ActivityLogFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    date_to = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

    class Meta:
        model = ActivityLog
        fields = ['action', 'actor', 'date_from', 'date_to']
