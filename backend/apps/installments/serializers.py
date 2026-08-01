from decimal import ROUND_DOWN, Decimal

from django.db import transaction
from rest_framework import serializers

from apps.sales.models import Sale

from .models import Installment, InstallmentPayment, PaymentPlan


class InstallmentPaymentSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = InstallmentPayment
        fields = [
            'id', 'receipt_number', 'installment', 'amount', 'method', 'reference',
            'paid_at', 'recorded_by', 'recorded_by_name', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'receipt_number', 'paid_at', 'recorded_by', 'created_at']

    def validate(self, attrs):
        installment = attrs['installment']
        amount = attrs['amount']

        if amount <= 0:
            raise serializers.ValidationError({'amount': 'Payment amount must be greater than zero.'})
        if installment.status == Installment.Status.PAID:
            raise serializers.ValidationError({'installment': 'This installment is already fully paid.'})
        if amount > installment.balance:
            raise serializers.ValidationError(
                {'amount': f'Amount exceeds the outstanding balance of {installment.balance}.'},
            )
        return attrs

    def create(self, validated_data):
        installment = validated_data['installment']
        validated_data['recorded_by'] = self.context['request'].user

        with transaction.atomic():
            payment = super().create(validated_data)

            installment.amount_paid += payment.amount
            fully_paid = installment.amount_paid >= installment.amount_due + installment.penalty_amount
            installment.status = Installment.Status.PAID if fully_paid else Installment.Status.PARTIAL
            installment.paid_at = payment.paid_at if fully_paid else None
            installment.save(update_fields=['amount_paid', 'status', 'paid_at', 'updated_at'])

            plan = installment.payment_plan
            if plan.status == PaymentPlan.Status.ACTIVE:
                if not plan.installments.exclude(status=Installment.Status.PAID).exists():
                    plan.status = PaymentPlan.Status.COMPLETED
                    plan.save(update_fields=['status', 'updated_at'])

        return payment


class InstallmentSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    payments = InstallmentPaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Installment
        fields = [
            'id', 'payment_plan', 'sequence', 'due_date', 'amount_due', 'penalty_amount',
            'amount_paid', 'balance', 'status', 'paid_at', 'flagged_overdue_at', 'payments',
        ]
        read_only_fields = fields


class PaymentPlanSerializer(serializers.ModelSerializer):
    sale_number = serializers.CharField(source='sale.sale_number', read_only=True)
    customer_name = serializers.CharField(source='sale.customer.full_name', read_only=True)
    total_payable = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    amount_paid = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    outstanding_balance = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    installments = InstallmentSerializer(many=True, read_only=True)

    class Meta:
        model = PaymentPlan
        fields = [
            'id', 'sale', 'sale_number', 'customer_name', 'status',
            'principal_amount', 'interest_rate', 'number_of_installments', 'installment_amount',
            'start_date', 'grace_period_days', 'penalty_rate',
            'total_payable', 'amount_paid', 'outstanding_balance',
            'created_by', 'notes', 'installments', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'principal_amount', 'installment_amount', 'created_by',
            'total_payable', 'amount_paid', 'outstanding_balance', 'installments',
            'created_at', 'updated_at',
        ]

    def validate(self, attrs):
        sale = attrs['sale']

        if sale.sale_type != Sale.SaleType.INSTALLMENT:
            raise serializers.ValidationError({'sale': 'A payment plan can only be created for an installment sale.'})
        if sale.status != Sale.Status.ACTIVE:
            raise serializers.ValidationError({'sale': 'Sale is not active.'})
        if PaymentPlan.objects.filter(sale=sale).exists():
            raise serializers.ValidationError({'sale': 'This sale already has a payment plan.'})
        if sale.balance_due <= 0:
            raise serializers.ValidationError({'sale': 'This sale has no outstanding balance to finance.'})
        if attrs['number_of_installments'] < 1:
            raise serializers.ValidationError({'number_of_installments': 'Must be at least 1.'})

        return attrs

    def create(self, validated_data):
        sale = validated_data['sale']
        number_of_installments = validated_data['number_of_installments']
        interest_rate = validated_data.get('interest_rate') or Decimal('0')

        principal_amount = sale.balance_due
        total_payable = principal_amount + (principal_amount * interest_rate / 100)
        installment_amount = (total_payable / number_of_installments).quantize(Decimal('0.01'), rounding=ROUND_DOWN)

        validated_data['principal_amount'] = principal_amount
        validated_data['installment_amount'] = installment_amount
        validated_data['created_by'] = self.context['request'].user

        with transaction.atomic():
            plan = super().create(validated_data)
            plan.generate_schedule()

        return plan
