from rest_framework import serializers

from .models import Bus, Driver, FollowUp, SiteVisit, SiteVisitBooking, VisitFeedback, VisitPhoto


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = ['id', 'full_name', 'phone', 'license_number', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BusSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.full_name', read_only=True, default=None)

    class Meta:
        model = Bus
        fields = [
            'id', 'registration_number', 'capacity', 'driver', 'driver_name', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VisitFeedbackSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='booking.lead.full_name', read_only=True)

    class Meta:
        model = VisitFeedback
        fields = [
            'id', 'booking', 'lead_name', 'rating', 'comments', 'interested_in_purchasing',
            'submitted_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'submitted_at', 'created_at', 'updated_at']


class FollowUpSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='booking.lead.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True, default=None)

    class Meta:
        model = FollowUp
        fields = [
            'id', 'booking', 'lead_name', 'due_date', 'status', 'notes',
            'assigned_to', 'assigned_to_name', 'completed_at', 'created_at', 'updated_at',
        ]
        # Status transitions (mark_done) happen only through the dedicated
        # action below, never by editing this field directly.
        read_only_fields = ['id', 'status', 'completed_at', 'created_at', 'updated_at']


class VisitPhotoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = VisitPhoto
        fields = [
            'id', 'site_visit', 'file', 'caption', 'uploaded_by', 'uploaded_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class SiteVisitBookingSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.full_name', read_only=True)
    lead_phone = serializers.CharField(source='lead.phone', read_only=True)
    is_checked_in = serializers.BooleanField(read_only=True)
    checked_in_by_name = serializers.CharField(source='checked_in_by.get_full_name', read_only=True, default=None)
    feedback = VisitFeedbackSerializer(read_only=True)
    follow_ups = FollowUpSerializer(many=True, read_only=True)

    class Meta:
        model = SiteVisitBooking
        fields = [
            'id', 'site_visit', 'lead', 'lead_name', 'lead_phone', 'status', 'guest_count',
            'qr_token', 'qr_code', 'is_checked_in', 'checked_in_at', 'checked_in_by', 'checked_in_by_name',
            'notes', 'feedback', 'follow_ups', 'created_at', 'updated_at',
        ]
        # Status transitions (confirm/cancel/mark_no_show) and check-in
        # happen only through the dedicated actions below.
        read_only_fields = [
            'id', 'status', 'qr_token', 'qr_code', 'checked_in_at', 'checked_in_by',
            'created_at', 'updated_at',
        ]


class SiteVisitSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    bus_registration = serializers.CharField(source='bus.registration_number', read_only=True, default=None)
    organized_by_name = serializers.CharField(source='organized_by.get_full_name', read_only=True, default=None)
    booking_count = serializers.IntegerField(source='bookings.count', read_only=True)
    checked_in_count = serializers.SerializerMethodField()

    bookings = SiteVisitBookingSerializer(many=True, read_only=True)
    photos = VisitPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = SiteVisit
        fields = [
            'id', 'reference_number', 'project', 'project_name', 'status',
            'visit_date', 'departure_time', 'meeting_point',
            'bus', 'bus_registration',
            'notes', 'organized_by', 'organized_by_name',
            'booking_count', 'checked_in_count', 'bookings', 'photos',
            'created_at', 'updated_at',
        ]
        # Status transitions (start/complete/cancel) happen only through the
        # dedicated actions below, never by editing this field directly.
        read_only_fields = ['id', 'reference_number', 'status', 'organized_by', 'created_at', 'updated_at']

    def get_checked_in_count(self, obj):
        return sum(1 for booking in obj.bookings.all() if booking.checked_in_at is not None)

    def create(self, validated_data):
        validated_data['organized_by'] = self.context['request'].user
        return super().create(validated_data)
