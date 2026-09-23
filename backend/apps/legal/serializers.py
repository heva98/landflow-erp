from rest_framework import serializers

from apps.documents.serializers import ContentTypeField

from .models import Contract, DocumentTemplate, OwnershipTransfer, PowerOfAttorney, SaleAgreement, TitleDeed, Witness


class WitnessSerializer(serializers.ModelSerializer):
    content_type = ContentTypeField()

    class Meta:
        model = Witness
        fields = [
            'id', 'content_type', 'object_id', 'full_name', 'national_id', 'phone', 'signed_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SaleAgreementSerializer(serializers.ModelSerializer):
    sale_number = serializers.CharField(source='sale.sale_number', read_only=True)
    prepared_by_name = serializers.CharField(source='prepared_by.get_full_name', read_only=True, default=None)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)
    witnesses = WitnessSerializer(many=True, read_only=True)

    class Meta:
        model = SaleAgreement
        fields = [
            'id', 'sale', 'sale_number', 'agreement_number', 'status', 'terms', 'signed_date',
            'prepared_by', 'prepared_by_name',
            'approved_by', 'approved_by_name', 'approved_at', 'voided_at', 'void_reason',
            'witnesses', 'created_at', 'updated_at',
        ]
        # Status transitions (send_for_signature/mark_signed/approve/void)
        # happen only through the dedicated actions below, never by editing
        # this field directly.
        read_only_fields = [
            'id', 'agreement_number', 'status', 'prepared_by',
            'approved_by', 'approved_at', 'voided_at', 'void_reason',
            'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        validated_data['prepared_by'] = self.context['request'].user
        return super().create(validated_data)


class TitleDeedSerializer(serializers.ModelSerializer):
    sale_number = serializers.CharField(source='sale.sale_number', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = TitleDeed
        fields = [
            'id', 'sale', 'sale_number', 'deed_number', 'status', 'registry_office',
            'applied_date', 'issued_date', 'notes',
            'approved_by', 'approved_by_name', 'approved_at',
            'created_at', 'updated_at',
        ]
        # Status transitions (apply/mark_issued/approve) happen only through
        # the dedicated actions below.
        read_only_fields = [
            'id', 'status', 'applied_date', 'issued_date',
            'approved_by', 'approved_at', 'created_at', 'updated_at',
        ]


class PowerOfAttorneySerializer(serializers.ModelSerializer):
    sale_number = serializers.CharField(source='sale.sale_number', read_only=True, default=None)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)
    witnesses = WitnessSerializer(many=True, read_only=True)

    class Meta:
        model = PowerOfAttorney
        fields = [
            'id', 'poa_number', 'sale', 'sale_number', 'grantor_name', 'grantee_name', 'status',
            'granted_date', 'expiry_date', 'notes',
            'approved_by', 'approved_by_name', 'approved_at', 'revoked_at', 'revocation_reason',
            'witnesses', 'created_at', 'updated_at',
        ]
        # Status transitions (approve/revoke/expire) happen only through the
        # dedicated actions below.
        read_only_fields = [
            'id', 'poa_number', 'status',
            'approved_by', 'approved_at', 'revoked_at', 'revocation_reason',
            'created_at', 'updated_at',
        ]


class ContractSerializer(serializers.ModelSerializer):
    content_type = ContentTypeField(required=False, allow_null=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default=None)
    witnesses = WitnessSerializer(many=True, read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id', 'contract_number', 'title', 'contract_type', 'counterparty_name', 'status',
            'start_date', 'end_date', 'notes', 'content_type', 'object_id',
            'created_by', 'created_by_name', 'witnesses', 'created_at', 'updated_at',
        ]
        # Status transitions (activate/terminate) happen only through the
        # dedicated actions below.
        read_only_fields = ['id', 'contract_number', 'status', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class OwnershipTransferSerializer(serializers.ModelSerializer):
    sale_number = serializers.CharField(source='sale.sale_number', read_only=True)
    plot_number = serializers.CharField(source='sale.plot.plot_number', read_only=True)
    customer_name = serializers.CharField(source='sale.customer.full_name', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True, default=None)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)
    witnesses = WitnessSerializer(many=True, read_only=True)

    class Meta:
        model = OwnershipTransfer
        fields = [
            'id', 'sale', 'sale_number', 'plot_number', 'customer_name', 'transfer_number', 'status',
            'requested_by', 'requested_by_name',
            'approved_by', 'approved_by_name', 'approved_at', 'completed_at', 'rejection_reason', 'notes',
            'witnesses', 'created_at', 'updated_at',
        ]
        # Status transitions (approve/reject/complete) happen only through
        # the dedicated actions below.
        read_only_fields = [
            'id', 'transfer_number', 'status', 'requested_by',
            'approved_by', 'approved_at', 'completed_at', 'rejection_reason',
            'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)


class DocumentTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = DocumentTemplate
        fields = [
            'id', 'name', 'template_type', 'description', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
