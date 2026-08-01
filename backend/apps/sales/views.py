from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions
from apps.plots.models import Plot

from .filters import SaleFilter
from .models import Sale
from .serializers import SaleSerializer


class SaleViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet,
):
    """
    Sales are created and cancelled, never edited in place — the invoice and
    receipt generated at creation time would otherwise drift from the record
    they document. Use `cancel` to reverse a sale.
    """

    queryset = Sale.objects.select_related(
        'plot', 'customer', 'reservation', 'sold_by', 'invoice', 'payment_plan',
    ).prefetch_related('receipts').all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SaleFilter
    ordering_fields = ['sold_at', 'sale_price', 'created_at', 'status']

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        sale = self.get_object()
        if sale.status != Sale.Status.ACTIVE:
            return Response(
                {'detail': 'Only an active sale can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        sale.status = Sale.Status.CANCELLED
        sale.cancelled_at = timezone.now()
        sale.save(update_fields=['status', 'cancelled_at', 'updated_at'])
        Plot.objects.filter(
            pk=sale.plot_id, status=Plot.Status.SOLD, owner_id=sale.customer_id,
        ).update(status=Plot.Status.AVAILABLE, owner=None)
        return Response(self.get_serializer(sale).data)
