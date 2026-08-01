from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import RoleBasedModelPermissions

from .filters import InstallmentFilter, InstallmentPaymentFilter, PaymentPlanFilter
from .models import Installment, InstallmentPayment, PaymentPlan
from .serializers import InstallmentPaymentSerializer, InstallmentSerializer, PaymentPlanSerializer


class PaymentPlanViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet,
):
    """
    A plan's schedule is generated once at creation time (see
    PaymentPlan.generate_schedule) — there's no update endpoint here; record
    payments against individual installments instead.
    """

    queryset = PaymentPlan.objects.select_related('sale', 'sale__customer', 'created_by').prefetch_related(
        'installments__payments',
    ).all()
    serializer_class = PaymentPlanSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PaymentPlanFilter
    ordering_fields = ['start_date', 'created_at', 'status']


class InstallmentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Read-only — rows come from PaymentPlan.generate_schedule and update only via recorded payments."""

    queryset = Installment.objects.select_related('payment_plan__sale__customer').prefetch_related('payments').all()
    serializer_class = InstallmentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = InstallmentFilter
    ordering_fields = ['due_date', 'sequence', 'status']


class InstallmentPaymentViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet,
):
    """Payments are recorded once and never edited — correct a mistake with a new entry rather than editing history."""

    queryset = InstallmentPayment.objects.select_related(
        'installment__payment_plan__sale__customer', 'recorded_by',
    ).all()
    serializer_class = InstallmentPaymentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = InstallmentPaymentFilter
    ordering_fields = ['paid_at', 'amount']
