from django.db.models import Count, Q, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions

from .filters import (
    AgentFilter, CommissionPaymentFilter, CommissionPlanFilter, CommissionTierFilter, SalesTargetFilter,
    TerritoryFilter,
)
from .models import Agent, CommissionPayment, CommissionPlan, CommissionTier, SalesTarget, Territory
from .permissions import CanManageCommissionPaymentWorkflow
from .serializers import (
    AgentRankingSerializer, AgentSerializer, CommissionPaymentSerializer, CommissionPlanSerializer,
    CommissionTierSerializer, SalesTargetSerializer, TerritorySerializer,
)


class TerritoryViewSet(viewsets.ModelViewSet):
    queryset = Territory.objects.all()
    serializer_class = TerritorySerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TerritoryFilter
    search_fields = ['name', 'region']
    ordering_fields = ['name']


class CommissionPlanViewSet(viewsets.ModelViewSet):
    queryset = CommissionPlan.objects.prefetch_related('tiers').all()
    serializer_class = CommissionPlanSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CommissionPlanFilter
    search_fields = ['name']
    ordering_fields = ['name']


class CommissionTierViewSet(viewsets.ModelViewSet):
    queryset = CommissionTier.objects.select_related('plan').all()
    serializer_class = CommissionTierSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = CommissionTierFilter
    ordering_fields = ['min_amount']


class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.select_related('employee', 'territory', 'commission_plan').all()
    serializer_class = AgentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AgentFilter
    search_fields = ['agent_code', 'employee__full_name', 'employee__employee_number']
    ordering_fields = ['agent_code', 'created_at']

    @action(detail=False, methods=['get'])
    def rankings(self, request):
        """
        Ranks active agents by commission earned (approved or paid), optionally
        scoped to a period via ?start_date=&end_date=. Computed on request
        rather than stored — a ranking is a snapshot of a moving total, not a
        fact worth persisting and keeping in sync.
        """
        commission_filter = Q(commission_payments__status__in=[
            CommissionPayment.Status.APPROVED, CommissionPayment.Status.PAID,
        ])
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            commission_filter &= Q(commission_payments__calculated_at__date__gte=start_date)
        if end_date:
            commission_filter &= Q(commission_payments__calculated_at__date__lte=end_date)

        agents = self.filter_queryset(self.get_queryset()).filter(is_active=True).annotate(
            total_commission=Sum('commission_payments__amount', filter=commission_filter),
            sale_count=Count('commission_payments', filter=commission_filter),
        ).order_by('-total_commission', 'agent_code')

        data = AgentRankingSerializer(agents, many=True).data
        for index, row in enumerate(data, start=1):
            row['rank'] = index
            row['total_commission'] = row['total_commission'] or '0.00'
        return Response(data)


class SalesTargetViewSet(viewsets.ModelViewSet):
    queryset = SalesTarget.objects.select_related('agent', 'agent__employee').all()
    serializer_class = SalesTargetSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SalesTargetFilter
    ordering_fields = ['period_start', 'created_at']


class CommissionPaymentViewSet(viewsets.ModelViewSet):
    queryset = CommissionPayment.objects.select_related(
        'agent', 'agent__employee', 'sale', 'commission_plan', 'approved_by',
    ).all()
    serializer_class = CommissionPaymentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = CommissionPaymentFilter
    ordering_fields = ['calculated_at', 'status']

    def get_permissions(self):
        if self.action in ('approve', 'mark_paid', 'cancel'):
            return [IsAuthenticated(), CanManageCommissionPaymentWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        payment = self.get_object()
        if payment.status != CommissionPayment.Status.PENDING:
            return Response(
                {'detail': 'Only a pending commission payment can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        payment.status = CommissionPayment.Status.APPROVED
        payment.approved_by = request.user
        payment.approved_at = timezone.now()
        payment.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(payment).data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        payment = self.get_object()
        if payment.status != CommissionPayment.Status.APPROVED:
            return Response(
                {'detail': 'Only an approved commission payment can be marked paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        payment.status = CommissionPayment.Status.PAID
        payment.paid_at = timezone.now()
        payment.payment_reference = request.data.get('payment_reference', payment.payment_reference)
        payment.save(update_fields=['status', 'paid_at', 'payment_reference', 'updated_at'])
        return Response(self.get_serializer(payment).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        payment = self.get_object()
        if payment.status == CommissionPayment.Status.PAID:
            return Response(
                {'detail': 'A paid commission payment cannot be cancelled.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        payment.status = CommissionPayment.Status.CANCELLED
        payment.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(payment).data)
