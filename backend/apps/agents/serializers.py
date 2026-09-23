from rest_framework import serializers

from .models import Agent, CommissionPayment, CommissionPlan, CommissionTier, SalesTarget, Territory


class TerritorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Territory
        fields = ['id', 'name', 'region', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CommissionTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionTier
        fields = ['id', 'plan', 'min_amount', 'max_amount', 'rate_percent', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CommissionPlanSerializer(serializers.ModelSerializer):
    tiers = CommissionTierSerializer(many=True, read_only=True)

    class Meta:
        model = CommissionPlan
        fields = [
            'id', 'name', 'plan_type', 'rate_percent', 'flat_amount', 'is_active', 'description', 'tiers',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AgentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_number = serializers.CharField(source='employee.employee_number', read_only=True)
    territory_name = serializers.CharField(source='territory.name', read_only=True, default=None)
    commission_plan_name = serializers.CharField(source='commission_plan.name', read_only=True, default=None)

    class Meta:
        model = Agent
        fields = [
            'id', 'employee', 'employee_name', 'employee_number', 'agent_code',
            'territory', 'territory_name', 'commission_plan', 'commission_plan_name',
            'is_active', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'agent_code', 'created_at', 'updated_at']


class AgentRankingSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    territory_name = serializers.CharField(source='territory.name', read_only=True, default=None)
    total_commission = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True, default=0)
    sale_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Agent
        fields = ['id', 'agent_code', 'employee_name', 'territory_name', 'total_commission', 'sale_count']


class SalesTargetSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.employee.full_name', read_only=True)
    achieved_amount = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    achieved_plot_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = SalesTarget
        fields = [
            'id', 'agent', 'agent_name', 'period_start', 'period_end',
            'target_amount', 'target_plot_count', 'achieved_amount', 'achieved_plot_count',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CommissionPaymentSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.employee.full_name', read_only=True)
    sale_number = serializers.CharField(source='sale.sale_number', read_only=True, default=None)
    commission_plan_name = serializers.CharField(source='commission_plan.name', read_only=True, default=None)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = CommissionPayment
        fields = [
            'id', 'agent', 'agent_name', 'sale', 'sale_number', 'commission_plan', 'commission_plan_name',
            'amount', 'status', 'calculated_at', 'approved_by', 'approved_by_name', 'approved_at',
            'paid_at', 'payment_reference', 'notes', 'created_at', 'updated_at',
        ]
        # Status transitions (approve/mark_paid/cancel) happen only through
        # the dedicated actions, never by editing this field directly.
        read_only_fields = [
            'id', 'status', 'calculated_at', 'approved_by', 'approved_at', 'paid_at', 'created_at', 'updated_at',
        ]
