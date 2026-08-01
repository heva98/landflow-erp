from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions
from apps.plots.models import Plot

from .filters import ReservationFilter
from .models import Reservation
from .serializers import ReservationSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('plot', 'customer', 'reserved_by').all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ReservationFilter
    ordering_fields = ['reserved_at', 'expiry_date', 'created_at', 'status']

    # Converting a reservation into a sale is handled by the Sales module —
    # POST /sales/ with `reservation` set marks this reservation Converted
    # and the plot Sold as part of creating the Sale, Invoice and Receipt.

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != Reservation.Status.ACTIVE:
            return Response(
                {'detail': 'Only an active reservation can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reservation.status = Reservation.Status.CANCELLED
        reservation.cancelled_at = timezone.now()
        reservation.save(update_fields=['status', 'cancelled_at', 'updated_at'])
        Plot.objects.filter(pk=reservation.plot_id, status=Plot.Status.RESERVED).update(status=Plot.Status.AVAILABLE)
        return Response(self.get_serializer(reservation).data)
