from rest_framework import serializers

from .models import AcquisitionAttachment, LandAcquisition, LandOwner, Negotiation, PurchaseCost


class LandOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandOwner
        fields = [
            'id', 'acquisition', 'full_name', 'national_id', 'phone', 'email', 'address',
            'ownership_percentage', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NegotiationSerializer(serializers.ModelSerializer):
    negotiated_by_name = serializers.CharField(source='negotiated_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = Negotiation
        fields = [
            'id', 'acquisition', 'negotiated_on', 'offered_price', 'counter_offer_price', 'notes',
            'negotiated_by', 'negotiated_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'negotiated_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['negotiated_by'] = self.context['request'].user
        return super().create(validated_data)


class PurchaseCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseCost
        fields = ['id', 'acquisition', 'cost_type', 'description', 'amount', 'incurred_on', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AcquisitionAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = AcquisitionAttachment
        fields = [
            'id', 'acquisition', 'document_type', 'file', 'description',
            'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class LandAcquisitionSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default=None)
    project_name = serializers.CharField(source='project.name', read_only=True, default=None)
    total_purchase_cost = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    owners = LandOwnerSerializer(many=True, read_only=True)
    negotiations = NegotiationSerializer(many=True, read_only=True)
    purchase_costs = PurchaseCostSerializer(many=True, read_only=True)
    attachments = AcquisitionAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = LandAcquisition
        fields = [
            'id', 'reference_number', 'name', 'status', 'description',
            'location', 'region', 'district', 'latitude', 'longitude', 'area_sqm',
            'ownership_verified', 'legal_checks_passed', 'due_diligence_notes',
            'valuation_amount', 'valuation_date', 'valuator_name',
            'asking_price', 'purchase_price', 'total_purchase_cost', 'purchased_at',
            'approved_by', 'approved_by_name', 'approved_at',
            'cancelled_at', 'cancellation_reason',
            'project', 'project_name',
            'notes', 'created_by', 'created_by_name',
            'owners', 'negotiations', 'purchase_costs', 'attachments',
            'created_at', 'updated_at',
        ]
        # Status transitions (approve/mark_purchased/cancel) and the spawned
        # project link are mutated only through the dedicated actions below,
        # never by editing these fields directly.
        read_only_fields = [
            'id', 'reference_number', 'status',
            'purchased_at', 'approved_by', 'approved_at', 'cancelled_at', 'cancellation_reason',
            'project', 'created_by', 'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
