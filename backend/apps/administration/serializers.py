from rest_framework import serializers

from .models import ActivityLog, ApprovalStep, ApprovalWorkflow, Currency, Location, SystemSetting


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol', 'exchange_rate', 'is_base', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LocationSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)

    class Meta:
        model = Location
        fields = [
            'id', 'name', 'location_type', 'parent', 'parent_name', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        location_type = attrs.get('location_type', getattr(self.instance, 'location_type', None))
        parent = attrs.get('parent', getattr(self.instance, 'parent', None))

        if location_type == Location.LocationType.REGION and parent is not None:
            raise serializers.ValidationError({'parent': 'A region cannot have a parent location.'})
        if location_type == Location.LocationType.DISTRICT:
            if parent is None or parent.location_type != Location.LocationType.REGION:
                raise serializers.ValidationError({'parent': 'A district must belong to a region.'})
        if location_type == Location.LocationType.WARD:
            if parent is None or parent.location_type != Location.LocationType.DISTRICT:
                raise serializers.ValidationError({'parent': 'A ward must belong to a district.'})
        return attrs


class SystemSettingSerializer(serializers.ModelSerializer):
    base_currency_code = serializers.CharField(source='base_currency.code', read_only=True, default=None)

    class Meta:
        model = SystemSetting
        fields = [
            'id', 'company_name', 'company_address', 'company_phone', 'company_email',
            'base_currency', 'base_currency_code', 'date_format', 'timezone', 'fiscal_year_start_month',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ApprovalStepSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = ApprovalStep
        fields = ['id', 'workflow', 'order', 'role', 'role_name', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    steps = ApprovalStepSerializer(many=True, read_only=True)

    class Meta:
        model = ApprovalWorkflow
        fields = [
            'id', 'name', 'workflow_type', 'description', 'min_amount', 'is_active', 'steps',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source='actor.email', read_only=True, default=None)

    class Meta:
        model = ActivityLog
        fields = ['id', 'actor', 'actor_email', 'action', 'description', 'ip_address', 'created_at']
        read_only_fields = fields
