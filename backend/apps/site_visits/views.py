from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions
from apps.crm.models import Lead

from .filters import (
    BusFilter, DriverFilter, FollowUpFilter, SiteVisitBookingFilter, SiteVisitFilter, VisitFeedbackFilter,
    VisitPhotoFilter,
)
from .models import Bus, Driver, FollowUp, SiteVisit, SiteVisitBooking, VisitFeedback, VisitPhoto
from .serializers import (
    BusSerializer, DriverSerializer, FollowUpSerializer, SiteVisitBookingSerializer, SiteVisitSerializer,
    VisitFeedbackSerializer, VisitPhotoSerializer,
)


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DriverFilter
    search_fields = ['full_name', 'license_number']
    ordering_fields = ['full_name', 'created_at']


class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.select_related('driver').all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = BusFilter
    search_fields = ['registration_number']
    ordering_fields = ['registration_number', 'created_at']


class SiteVisitViewSet(viewsets.ModelViewSet):
    queryset = SiteVisit.objects.select_related('project', 'bus', 'organized_by').prefetch_related(
        'bookings', 'bookings__lead', 'bookings__feedback', 'bookings__follow_ups', 'photos',
    ).all()
    serializer_class = SiteVisitSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = SiteVisitFilter
    search_fields = ['reference_number', 'project__name']
    ordering_fields = ['visit_date', 'created_at', 'status']

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        visit = self.get_object()
        if visit.status != SiteVisit.Status.SCHEDULED:
            return Response(
                {'detail': 'Only a scheduled visit can be started.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        visit.status = SiteVisit.Status.IN_PROGRESS
        visit.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(visit).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        visit = self.get_object()
        if visit.status != SiteVisit.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Only a visit in progress can be completed.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        visit.status = SiteVisit.Status.COMPLETED
        visit.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(visit).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        visit = self.get_object()
        if visit.status in (SiteVisit.Status.COMPLETED, SiteVisit.Status.CANCELLED):
            return Response(
                {'detail': 'A completed or already-cancelled visit cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        visit.status = SiteVisit.Status.CANCELLED
        visit.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(visit).data)


class SiteVisitBookingViewSet(viewsets.ModelViewSet):
    queryset = SiteVisitBooking.objects.select_related(
        'site_visit', 'lead', 'checked_in_by', 'feedback',
    ).prefetch_related('follow_ups').all()
    serializer_class = SiteVisitBookingSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SiteVisitBookingFilter
    ordering_fields = ['created_at', 'status']

    def perform_create(self, serializer):
        booking = serializer.save()
        # A booked site visit is itself the "Site Visit" pipeline stage.
        Lead.objects.filter(pk=booking.lead_id).update(status=Lead.Status.SITE_VISIT)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        if booking.status != SiteVisitBooking.Status.BOOKED:
            return Response(
                {'detail': 'Only a booked reservation can be confirmed.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = SiteVisitBooking.Status.CONFIRMED
        booking.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == SiteVisitBooking.Status.CANCELLED:
            return Response(
                {'detail': 'This booking is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = SiteVisitBooking.Status.CANCELLED
        booking.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'])
    def mark_no_show(self, request, pk=None):
        booking = self.get_object()
        if booking.status not in (SiteVisitBooking.Status.BOOKED, SiteVisitBooking.Status.CONFIRMED):
            return Response(
                {'detail': 'Only a booked or confirmed reservation can be marked no-show.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = SiteVisitBooking.Status.NO_SHOW
        booking.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(booking).data)

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """
        Looks a booking up by the token encoded in its QR code — not by id,
        since the scanning device only ever has the token — and records
        attendance. Not gated to a particular site visit, so the same
        check-in flow works no matter which visit the QR belongs to.
        """
        token = str(request.data.get('token', '')).strip()
        if not token:
            return Response({'token': 'A QR token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            booking = SiteVisitBooking.objects.select_related('site_visit', 'lead').get(qr_token=token)
        except SiteVisitBooking.DoesNotExist:
            return Response({'detail': 'No booking found for this QR code.'}, status=status.HTTP_404_NOT_FOUND)
        if booking.status == SiteVisitBooking.Status.CANCELLED:
            return Response(
                {'detail': 'This booking has been cancelled.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        if booking.checked_in_at:
            return Response(
                {'detail': f'{booking.lead.full_name} is already checked in.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        booking.checked_in_at = timezone.now()
        booking.checked_in_by = request.user
        booking.save(update_fields=['checked_in_at', 'checked_in_by', 'updated_at'])
        return Response(self.get_serializer(booking).data)


class VisitFeedbackViewSet(viewsets.ModelViewSet):
    queryset = VisitFeedback.objects.select_related('booking', 'booking__lead').all()
    serializer_class = VisitFeedbackSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = VisitFeedbackFilter
    ordering_fields = ['submitted_at', 'rating']


class VisitPhotoViewSet(viewsets.ModelViewSet):
    queryset = VisitPhoto.objects.select_related('site_visit', 'uploaded_by').all()
    serializer_class = VisitPhotoSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = VisitPhotoFilter
    ordering_fields = ['created_at']


class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.select_related('booking', 'booking__lead', 'assigned_to').all()
    serializer_class = FollowUpSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = FollowUpFilter
    ordering_fields = ['due_date', 'created_at']

    @action(detail=True, methods=['post'])
    def mark_done(self, request, pk=None):
        follow_up = self.get_object()
        if follow_up.status == FollowUp.Status.DONE:
            return Response({'detail': 'This follow-up is already done.'}, status=status.HTTP_400_BAD_REQUEST)
        follow_up.status = FollowUp.Status.DONE
        follow_up.completed_at = timezone.now()
        follow_up.save(update_fields=['status', 'completed_at', 'updated_at'])
        return Response(self.get_serializer(follow_up).data)
