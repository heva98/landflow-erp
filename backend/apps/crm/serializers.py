from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import CommunicationLog, Customer, Lead, Note, Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'registration_number', 'tin', 'email', 'phone', 'address', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True, default=None)

    class Meta:
        model = Customer
        fields = [
            'id', 'customer_type', 'full_name', 'organization', 'organization_name',
            'phone', 'email', 'address',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeadSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True, default=None)
    interested_project_name = serializers.CharField(source='interested_project.name', read_only=True, default=None)
    referred_by_name = serializers.CharField(source='referred_by.full_name', read_only=True, default=None)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True, default=None)

    class Meta:
        model = Lead
        fields = [
            'id', 'full_name', 'phone', 'email', 'source', 'status', 'lost_reason',
            'organization', 'organization_name',
            'interested_project', 'interested_project_name',
            'referred_by', 'referred_by_name',
            'assigned_to', 'assigned_to_name',
            'converted_customer',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GenericCRMTargetSerializer(serializers.Serializer):
    """
    Shared by Note and CommunicationLog: both attach to exactly one of a
    Lead, Customer or Organization via a generic relation. Clients pass one
    of the `lead`/`customer`/`organization` FK fields instead of dealing
    with raw content-type ids, and this resolves it to `content_type` +
    `object_id` on validate().
    """
    lead = serializers.PrimaryKeyRelatedField(
        queryset=Lead.objects.all(), required=False, allow_null=True, write_only=True,
    )
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), required=False, allow_null=True, write_only=True,
    )
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(), required=False, allow_null=True, write_only=True,
    )
    target_type = serializers.SerializerMethodField()
    target_id = serializers.UUIDField(source='object_id', read_only=True)

    def get_target_type(self, obj):
        return obj.content_type.model

    def validate(self, attrs):
        selected = {
            key: attrs.pop(key, None) for key in ('lead', 'customer', 'organization')
        }
        selected = {key: value for key, value in selected.items() if value is not None}
        if self.instance is None and len(selected) != 1:
            raise serializers.ValidationError('Provide exactly one of lead, customer, or organization.')
        if selected:
            _, target = next(iter(selected.items()))
            attrs['content_type'] = ContentType.objects.get_for_model(target)
            attrs['object_id'] = target.pk
        return super().validate(attrs)


class NoteSerializer(GenericCRMTargetSerializer, serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True, default=None)

    class Meta:
        model = Note
        fields = [
            'id', 'lead', 'customer', 'organization', 'target_type', 'target_id',
            'author', 'author_name', 'body', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class CommunicationLogSerializer(GenericCRMTargetSerializer, serializers.ModelSerializer):
    logged_by_name = serializers.CharField(source='logged_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = CommunicationLog
        fields = [
            'id', 'lead', 'customer', 'organization', 'target_type', 'target_id',
            'channel', 'direction', 'subject', 'body', 'occurred_at',
            'logged_by', 'logged_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'logged_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['logged_by'] = self.context['request'].user
        return super().create(validated_data)
