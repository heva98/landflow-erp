import django_filters

from .models import Account, Budget, CashBankAccount, Expense, Income, JournalEntry, JournalLine


class AccountFilter(django_filters.FilterSet):
    class Meta:
        model = Account
        fields = ['type', 'parent', 'is_active']


class CashBankAccountFilter(django_filters.FilterSet):
    class Meta:
        model = CashBankAccount
        fields = ['kind', 'is_active']


class JournalEntryFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = JournalEntry
        fields = ['source', 'status', 'date_from', 'date_to']


class JournalLineFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='journal_entry__date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='journal_entry__date', lookup_expr='lte')

    class Meta:
        model = JournalLine
        fields = ['account', 'journal_entry', 'date_from', 'date_to']


class IncomeFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = Income
        fields = ['account', 'deposit_to', 'source', 'date_from', 'date_to']


class ExpenseFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    class Meta:
        model = Expense
        fields = ['account', 'paid_from', 'date_from', 'date_to']


class BudgetFilter(django_filters.FilterSet):
    class Meta:
        model = Budget
        fields = ['period_start', 'period_end']
