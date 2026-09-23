import django_filters

from .models import Agent, CommissionPayment, CommissionPlan, CommissionTier, SalesTarget, Territory


class TerritoryFilter(django_filters.FilterSet):
    class Meta:
        model = Territory
        fields = ['region']


class CommissionPlanFilter(django_filters.FilterSet):
    class Meta:
        model = CommissionPlan
        fields = ['plan_type', 'is_active']


class CommissionTierFilter(django_filters.FilterSet):
    class Meta:
        model = CommissionTier
        fields = ['plan']


class AgentFilter(django_filters.FilterSet):
    class Meta:
        model = Agent
        fields = ['employee', 'territory', 'commission_plan', 'is_active']


class SalesTargetFilter(django_filters.FilterSet):
    class Meta:
        model = SalesTarget
        fields = ['agent']


class CommissionPaymentFilter(django_filters.FilterSet):
    class Meta:
        model = CommissionPayment
        fields = ['agent', 'status']
