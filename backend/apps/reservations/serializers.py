from django.utils import timezone
from rest_framework import serializers

from apps.plots.models import Plot

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    plot_number = serializers.CharField(source='plot.plot_number', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    reserved_by_name = serializers.CharField(source='reserved_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = Reservation
        fields = [
            'id', 'plot', 'plot_number', 'customer', 'customer_name', 'status',
            'reservation_fee', 'reserved_at', 'expiry_date',
            'converted_at', 'cancelled_at', 'reserved_by', 'reserved_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'converted_at', 'cancelled_at', 'reserved_by',
            'created_at', 'updated_at',
        ]

    def validate_plot(self, plot):
        if self.instance is None and plot.status != Plot.Status.AVAILABLE:
            raise serializers.ValidationError('This plot is not available for reservation.')
        return plot

    def validate_expiry_date(self, expiry_date):
        if expiry_date <= timezone.now():
            raise serializers.ValidationError('Expiry date must be in the future.')
        return expiry_date

    def create(self, validated_data):
        validated_data['reserved_by'] = self.context['request'].user
        reservation = super().create(validated_data)
        Plot.objects.filter(pk=reservation.plot_id).update(status=Plot.Status.RESERVED)
        return reservation
