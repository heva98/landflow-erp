from django.db import transaction
from rest_framework import serializers

from . import services
from .models import Account, Budget, BudgetLine, CashBankAccount, Expense, Income, JournalEntry, JournalLine


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'code', 'name', 'type', 'parent', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_parent(self, value):
        if value and self.instance and value.pk == self.instance.pk:
            raise serializers.ValidationError('An account cannot be its own parent.')
        return value


class CashBankAccountSerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    balance = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.filter(type=Account.Type.ASSET))

    class Meta:
        model = CashBankAccount
        fields = [
            'id', 'name', 'kind', 'account', 'account_code', 'bank_name', 'branch', 'account_number',
            'currency', 'opening_balance', 'balance', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JournalLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalLine
        fields = ['id', 'account', 'account_name', 'debit', 'credit', 'description']
        read_only_fields = ['id']

    def validate(self, attrs):
        debit = attrs.get('debit') or 0
        credit = attrs.get('credit') or 0
        if (debit > 0) == (credit > 0):
            raise serializers.ValidationError('Each line needs either a debit or a credit amount, not both or neither.')
        return attrs


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True)
    total_debit = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    total_credit = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    is_balanced = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'entry_number', 'date', 'memo', 'source', 'status', 'lines',
            'total_debit', 'total_credit', 'is_balanced', 'posted_at',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'entry_number', 'source', 'status', 'posted_at', 'created_by', 'created_at', 'updated_at',
        ]

    def validate_lines(self, lines):
        if len(lines) < 2:
            raise serializers.ValidationError('A journal entry needs at least two lines.')
        return lines

    def validate(self, attrs):
        lines = attrs.get('lines', [])
        total_debit = sum((line.get('debit') or 0) for line in lines)
        total_credit = sum((line.get('credit') or 0) for line in lines)
        if total_debit != total_credit:
            raise serializers.ValidationError('Total debits must equal total credits.')
        return attrs

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        validated_data['created_by'] = self.context['request'].user
        validated_data['source'] = JournalEntry.Source.MANUAL

        with transaction.atomic():
            entry = super().create(validated_data)
            JournalLine.objects.bulk_create([JournalLine(journal_entry=entry, **line) for line in lines_data])

        return entry


class IncomeSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    deposit_to_name = serializers.CharField(source='deposit_to.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True, default=None)
    journal_entry_number = serializers.CharField(source='journal_entry.entry_number', read_only=True, default=None)

    class Meta:
        model = Income
        fields = [
            'id', 'income_number', 'account', 'account_name', 'deposit_to', 'deposit_to_name',
            'amount', 'date', 'source', 'description', 'recorded_by', 'recorded_by_name',
            'journal_entry', 'journal_entry_number', 'created_at',
        ]
        read_only_fields = ['id', 'income_number', 'source', 'recorded_by', 'journal_entry', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['recorded_by'] = user
        # 'sale'/'installment' are reserved for the auto-pull path (signals.py)
        # — anything entered here through the API is manual, by definition.
        validated_data['source'] = Income.Source.OTHER

        with transaction.atomic():
            income = super().create(validated_data)
            entry = services.post_journal_entry(
                date=income.date, memo=income.description or f'Income {income.income_number}',
                source=JournalEntry.Source.MANUAL, debit_account=income.deposit_to.account,
                credit_account=income.account, amount=income.amount, created_by=user,
            )
            income.journal_entry = entry
            income.save(update_fields=['journal_entry', 'updated_at'])

        return income


class ExpenseSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    paid_from_name = serializers.CharField(source='paid_from.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True, default=None)
    journal_entry_number = serializers.CharField(source='journal_entry.entry_number', read_only=True, default=None)

    class Meta:
        model = Expense
        fields = [
            'id', 'expense_number', 'account', 'account_name', 'paid_from', 'paid_from_name',
            'amount', 'date', 'payee', 'description', 'recorded_by', 'recorded_by_name',
            'journal_entry', 'journal_entry_number', 'created_at',
        ]
        read_only_fields = ['id', 'expense_number', 'recorded_by', 'journal_entry', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['recorded_by'] = user

        with transaction.atomic():
            expense = super().create(validated_data)
            entry = services.post_journal_entry(
                date=expense.date, memo=expense.description or f'Expense {expense.expense_number}',
                source=JournalEntry.Source.MANUAL, debit_account=expense.account,
                credit_account=expense.paid_from.account, amount=expense.amount, created_by=user,
            )
            expense.journal_entry = entry
            expense.save(update_fields=['journal_entry', 'updated_at'])

        return expense


class BudgetLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    actual_amount = serializers.SerializerMethodField()
    variance = serializers.SerializerMethodField()

    class Meta:
        model = BudgetLine
        fields = ['id', 'account', 'account_name', 'amount', 'actual_amount', 'variance']
        read_only_fields = ['id']

    def get_actual_amount(self, obj):
        return obj.actual_amount

    def get_variance(self, obj):
        return obj.variance


class BudgetSerializer(serializers.ModelSerializer):
    lines = BudgetLineSerializer(many=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = Budget
        fields = [
            'id', 'name', 'period_start', 'period_end', 'notes', 'lines',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        if attrs['period_end'] < attrs['period_start']:
            raise serializers.ValidationError({'period_end': 'Must be on or after the period start date.'})
        accounts = [line['account'] for line in attrs.get('lines', [])]
        if len(accounts) != len(set(accounts)):
            raise serializers.ValidationError({'lines': 'Each account can only appear once per budget.'})
        return attrs

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        validated_data['created_by'] = self.context['request'].user

        with transaction.atomic():
            budget = super().create(validated_data)
            BudgetLine.objects.bulk_create([BudgetLine(budget=budget, **line) for line in lines_data])

        return budget
