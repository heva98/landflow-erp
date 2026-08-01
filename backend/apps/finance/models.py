import uuid
from decimal import Decimal

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q, Sum
from django.utils import timezone

from apps.core.models import BaseModel


def _generate_number(prefix):
    return f'{prefix}-{timezone.now():%Y%m}-{uuid.uuid4().hex[:8].upper()}'


class Account(BaseModel):
    """Chart of accounts — the ledger backbone that JournalLine posts to."""

    class Type(models.TextChoices):
        ASSET = 'asset', 'Asset'
        LIABILITY = 'liability', 'Liability'
        EQUITY = 'equity', 'Equity'
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'

    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=20, choices=Type.choices)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.PROTECT, related_name='children',
    )
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return f'{self.code} - {self.name}'


class CashBankAccount(BaseModel):
    """A real money-holding account (bank, cash drawer, petty cash) that
    backs an Asset account in the chart of accounts."""

    class Kind(models.TextChoices):
        BANK = 'bank', 'Bank'
        CASH = 'cash', 'Cash'
        PETTY_CASH = 'petty_cash', 'Petty Cash'

    name = models.CharField(max_length=150)
    kind = models.CharField(max_length=20, choices=Kind.choices)
    account = models.OneToOneField(
        Account, on_delete=models.PROTECT, related_name='cash_bank_account',
        limit_choices_to={'type': Account.Type.ASSET},
    )
    bank_name = models.CharField(max_length=150, blank=True)
    branch = models.CharField(max_length=150, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    currency = models.CharField(max_length=3, default='TZS')
    opening_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.get_kind_display()})'

    @property
    def balance(self):
        totals = self.account.journal_lines.filter(journal_entry__status=JournalEntry.Status.POSTED).aggregate(
            debit=Sum('debit'), credit=Sum('credit'),
        )
        debit = totals['debit'] or Decimal('0')
        credit = totals['credit'] or Decimal('0')
        return self.opening_balance + debit - credit


class JournalEntry(BaseModel):
    """Double-entry posting header. `lines` must balance (total debit ==
    total credit) before the entry is moved to Posted — enforced by the
    service/serializer layer, not the database."""

    class Source(models.TextChoices):
        MANUAL = 'manual', 'Manual'
        SALE = 'sale', 'Sale'
        INSTALLMENT = 'installment', 'Installment'
        SYSTEM = 'system', 'System'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        POSTED = 'posted', 'Posted'

    entry_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    date = models.DateField(default=timezone.localdate)
    memo = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.MANUAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    # Optional link back to the Sale/Receipt/InstallmentPayment/Income/Expense
    # that generated this entry automatically.
    content_type = models.ForeignKey(
        ContentType, null=True, blank=True, on_delete=models.SET_NULL, related_name='+',
    )
    object_id = models.CharField(max_length=255, blank=True)
    source_object = GenericForeignKey('content_type', 'object_id')

    posted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='journal_entries_created',
    )

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name_plural = 'Journal entries'

    def __str__(self):
        return f'{self.entry_number} ({self.get_status_display()})'

    def save(self, *args, **kwargs):
        if not self.entry_number:
            self.entry_number = _generate_number('JE')
        super().save(*args, **kwargs)

    @property
    def total_debit(self):
        return self.lines.aggregate(total=Sum('debit'))['total'] or Decimal('0')

    @property
    def total_credit(self):
        return self.lines.aggregate(total=Sum('credit'))['total'] or Decimal('0')

    @property
    def is_balanced(self):
        return self.total_debit == self.total_credit


class JournalLine(BaseModel):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='journal_lines')
    debit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['journal_entry', 'created_at']
        constraints = [
            models.CheckConstraint(
                check=~(Q(debit__gt=0) & Q(credit__gt=0)),
                name='journal_line_not_both_debit_and_credit',
            ),
            models.CheckConstraint(
                check=Q(debit__gt=0) | Q(credit__gt=0),
                name='journal_line_debit_or_credit_required',
            ),
        ]

    def __str__(self):
        return f'{self.account} Dr {self.debit} Cr {self.credit}'


class Income(BaseModel):
    """A recorded income transaction. Entries pulled in automatically from
    Sales receipts or Installment payments carry a `source` and
    `source_object` back to the originating record; manually recorded income
    (e.g. rent, interest) leaves those blank."""

    class Source(models.TextChoices):
        SALE = 'sale', 'Sale Receipt'
        INSTALLMENT = 'installment', 'Installment Payment'
        OTHER = 'other', 'Other'

    income_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    account = models.ForeignKey(
        Account, on_delete=models.PROTECT, related_name='income_entries',
        limit_choices_to={'type': Account.Type.INCOME},
    )
    deposit_to = models.ForeignKey(CashBankAccount, on_delete=models.PROTECT, related_name='income_entries')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField(default=timezone.localdate)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.OTHER)
    description = models.CharField(max_length=255, blank=True)

    content_type = models.ForeignKey(
        ContentType, null=True, blank=True, on_delete=models.SET_NULL, related_name='+',
    )
    object_id = models.CharField(max_length=255, blank=True)
    source_object = GenericForeignKey('content_type', 'object_id')

    journal_entry = models.OneToOneField(
        JournalEntry, null=True, blank=True, on_delete=models.SET_NULL, related_name='income',
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='income_recorded',
    )

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name_plural = 'Income'
        constraints = [
            models.UniqueConstraint(
                fields=['content_type', 'object_id'],
                condition=~Q(object_id=''),
                name='unique_income_source_object',
            ),
        ]

    def __str__(self):
        return f'{self.income_number} - {self.amount}'

    def save(self, *args, **kwargs):
        if not self.income_number:
            self.income_number = _generate_number('INC')
        super().save(*args, **kwargs)


class Expense(BaseModel):
    expense_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    account = models.ForeignKey(
        Account, on_delete=models.PROTECT, related_name='expense_entries',
        limit_choices_to={'type': Account.Type.EXPENSE},
    )
    paid_from = models.ForeignKey(CashBankAccount, on_delete=models.PROTECT, related_name='expense_entries')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField(default=timezone.localdate)
    payee = models.CharField(max_length=150, blank=True)
    description = models.CharField(max_length=255, blank=True)

    journal_entry = models.OneToOneField(
        JournalEntry, null=True, blank=True, on_delete=models.SET_NULL, related_name='expense',
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='expenses_recorded',
    )

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.expense_number} - {self.amount}'

    def save(self, *args, **kwargs):
        if not self.expense_number:
            self.expense_number = _generate_number('EXP')
        super().save(*args, **kwargs)


class Budget(BaseModel):
    name = models.CharField(max_length=150)
    period_start = models.DateField()
    period_end = models.DateField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='budgets_created',
    )

    class Meta:
        ordering = ['-period_start']

    def __str__(self):
        return f'{self.name} ({self.period_start} to {self.period_end})'


class BudgetLine(BaseModel):
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='budget_lines')
    amount = models.DecimalField(max_digits=14, decimal_places=2)

    class Meta:
        ordering = ['budget', 'account']
        constraints = [
            models.UniqueConstraint(fields=['budget', 'account'], name='unique_budget_line_per_account'),
        ]

    def __str__(self):
        return f'{self.account} budget of {self.amount} for {self.budget}'

    @property
    def actual_amount(self):
        totals = self.account.journal_lines.filter(
            journal_entry__status=JournalEntry.Status.POSTED,
            journal_entry__date__gte=self.budget.period_start,
            journal_entry__date__lte=self.budget.period_end,
        ).aggregate(debit=Sum('debit'), credit=Sum('credit'))
        debit = totals['debit'] or Decimal('0')
        credit = totals['credit'] or Decimal('0')
        if self.account.type == Account.Type.INCOME:
            return credit - debit
        return debit - credit

    @property
    def variance(self):
        return self.amount - self.actual_amount
