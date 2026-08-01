from django.utils import timezone
from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions

from . import reports
from .filters import (
    AccountFilter, BudgetFilter, CashBankAccountFilter, ExpenseFilter, IncomeFilter, JournalEntryFilter,
    JournalLineFilter,
)
from .models import Account, Budget, CashBankAccount, Expense, Income, JournalEntry, JournalLine
from .permissions import HasFinanceReportAccess
from .serializers import (
    AccountSerializer, BudgetSerializer, CashBankAccountSerializer, ExpenseSerializer, IncomeSerializer,
    JournalEntrySerializer, JournalLineSerializer,
)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.select_related('parent').all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AccountFilter
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'type']


class CashBankAccountViewSet(viewsets.ModelViewSet):
    queryset = CashBankAccount.objects.select_related('account').all()
    serializer_class = CashBankAccountSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CashBankAccountFilter
    search_fields = ['name', 'bank_name', 'account_number']
    ordering_fields = ['name', 'kind']


class JournalEntryViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet,
):
    """Lines are fixed at creation — there's no update endpoint. A manual
    entry starts as Draft and moves to Posted via the `post` action; entries
    created by the finance service layer (income/expense/auto-pull) are
    posted immediately."""

    queryset = JournalEntry.objects.select_related('created_by').prefetch_related('lines__account').all()
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = JournalEntryFilter
    ordering_fields = ['date', 'created_at']

    @action(detail=True, methods=['post'], url_path='post')
    def post_entry(self, request, pk=None):
        entry = self.get_object()
        if entry.status == JournalEntry.Status.POSTED:
            return Response({'detail': 'Entry is already posted.'}, status=status.HTTP_400_BAD_REQUEST)
        # Re-checked here (not just at creation) since this is the only path
        # that actually commits an entry to the ledger.
        if not entry.is_balanced or not entry.lines.exists():
            return Response(
                {'detail': 'Entry must have balanced debit/credit lines before it can be posted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.status = JournalEntry.Status.POSTED
        entry.posted_at = timezone.now()
        entry.save(update_fields=['status', 'posted_at', 'updated_at'])
        return Response(self.get_serializer(entry).data)


class JournalLineViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Read-only query surface over posted ledger lines — this is the
    General Ledger view."""

    queryset = JournalLine.objects.select_related('account', 'journal_entry').filter(
        journal_entry__status=JournalEntry.Status.POSTED,
    )
    serializer_class = JournalLineSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = JournalLineFilter
    ordering_fields = ['journal_entry__date', 'created_at']


class IncomeViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Create-only: an income record always posts an immutable journal entry
    alongside it, so it isn't edited in place afterwards."""

    queryset = Income.objects.select_related('account', 'deposit_to', 'recorded_by', 'journal_entry').all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = IncomeFilter
    ordering_fields = ['date', 'amount', 'created_at']


class ExpenseViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Expense.objects.select_related('account', 'paid_from', 'recorded_by', 'journal_entry').all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ExpenseFilter
    ordering_fields = ['date', 'amount', 'created_at']


class BudgetViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Lines are fixed at creation, same reasoning as JournalEntry — revise
    a budget by creating a new one rather than editing an existing period."""

    queryset = Budget.objects.select_related('created_by').prefetch_related('lines__account').all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = BudgetFilter
    ordering_fields = ['period_start', 'created_at']


class FinanceReportViewSet(viewsets.ViewSet):
    permission_classes = [HasFinanceReportAccess]

    def _date_range(self, request):
        date_from = parse_date(request.query_params.get('date_from', ''))
        date_to = parse_date(request.query_params.get('date_to', ''))
        if not date_from or not date_to:
            raise ValidationError('date_from and date_to are required query params (YYYY-MM-DD).')
        return date_from, date_to

    @action(detail=False, url_path='profit-and-loss')
    def profit_and_loss(self, request):
        date_from, date_to = self._date_range(request)
        return Response(reports.profit_and_loss(date_from, date_to))

    @action(detail=False, url_path='cash-flow')
    def cash_flow(self, request):
        date_from, date_to = self._date_range(request)
        return Response(reports.cash_flow(date_from, date_to))
