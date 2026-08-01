from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.plots.models import Plot
from apps.reservations.models import Reservation

from .models import Invoice, Receipt, Sale
from .pdf import build_stub_pdf


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'amount', 'issued_at', 'due_date', 'file']
        read_only_fields = fields


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = ['id', 'receipt_number', 'amount', 'payment_method', 'reference', 'received_at', 'file']
        read_only_fields = fields


class SaleSerializer(serializers.ModelSerializer):
    plot_number = serializers.CharField(source='plot.plot_number', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    sold_by_name = serializers.CharField(source='sold_by.get_full_name', read_only=True, default=None)
    net_price = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    balance_due = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    invoice = InvoiceSerializer(read_only=True)
    receipts = ReceiptSerializer(many=True, read_only=True)

    # Write-only inputs used to create the down-payment receipt; not Sale fields.
    payment_method = serializers.ChoiceField(choices=Receipt.PaymentMethod.choices, write_only=True)
    reference = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=100)

    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'plot', 'plot_number', 'customer', 'customer_name',
            'reservation', 'sale_type', 'status',
            'sale_price', 'discount', 'down_payment', 'net_price', 'balance_due',
            'payment_method', 'reference',
            'sold_at', 'cancelled_at', 'sold_by', 'sold_by_name', 'notes',
            'invoice', 'receipts',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'sale_number', 'status', 'sold_at', 'cancelled_at', 'sold_by',
            'created_at', 'updated_at',
        ]
        extra_kwargs = {
            'plot': {'required': False},
            'customer': {'required': False},
        }

    def validate(self, attrs):
        reservation = attrs.get('reservation')

        if reservation:
            if reservation.status != Reservation.Status.ACTIVE:
                raise serializers.ValidationError({'reservation': 'Only an active reservation can be sold.'})
            attrs['plot'] = reservation.plot
            attrs['customer'] = reservation.customer
        else:
            plot = attrs.get('plot')
            if not plot or not attrs.get('customer'):
                raise serializers.ValidationError('Either a reservation, or both plot and customer, are required.')
            if plot.status != Plot.Status.AVAILABLE:
                raise serializers.ValidationError({'plot': 'This plot is not available for sale.'})

        sale_price = attrs['sale_price']
        discount = attrs.get('discount') or 0
        down_payment = attrs.get('down_payment') or 0
        net_price = sale_price - discount

        if down_payment <= 0:
            raise serializers.ValidationError({'down_payment': 'Down payment must be greater than zero.'})
        if down_payment > net_price:
            raise serializers.ValidationError({'down_payment': 'Down payment cannot exceed the net sale price.'})
        if attrs.get('sale_type') == Sale.SaleType.CASH and down_payment != net_price:
            raise serializers.ValidationError({'down_payment': 'Cash sales must be paid in full at the time of sale.'})

        return attrs

    def create(self, validated_data):
        payment_method = validated_data.pop('payment_method')
        reference = validated_data.pop('reference', '')
        reservation = validated_data.get('reservation')
        user = self.context['request'].user

        with transaction.atomic():
            validated_data['sold_by'] = user
            sale = super().create(validated_data)

            Plot.objects.filter(pk=sale.plot_id).update(status=Plot.Status.SOLD, owner=sale.customer)

            if reservation:
                Reservation.objects.filter(pk=reservation.pk).update(
                    status=Reservation.Status.CONVERTED, converted_at=timezone.now(),
                )

            invoice = Invoice.objects.create(sale=sale, amount=sale.net_price, issued_by=user)
            invoice.file.save(
                f'{invoice.invoice_number}.pdf',
                ContentFile(build_stub_pdf(f'Invoice {invoice.invoice_number}', [
                    f'Sale: {sale.sale_number}',
                    f'Plot: {sale.plot.plot_number}',
                    f'Customer: {sale.customer.full_name}',
                    f'Amount due: {invoice.amount} TZS',
                ])),
                save=True,
            )

            receipt = Receipt.objects.create(
                sale=sale, amount=sale.down_payment, payment_method=payment_method,
                reference=reference, issued_by=user,
            )
            receipt.file.save(
                f'{receipt.receipt_number}.pdf',
                ContentFile(build_stub_pdf(f'Receipt {receipt.receipt_number}', [
                    f'Sale: {sale.sale_number}',
                    f'Received from: {sale.customer.full_name}',
                    f'Amount: {receipt.amount} TZS',
                    f'Method: {receipt.get_payment_method_display()}',
                ])),
                save=True,
            )

        return sale
