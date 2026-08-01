"""
Shared journal-posting logic. Used both by the auto-pull path (signals.py,
for Sales receipts / Installment payments) and by IncomeSerializer /
ExpenseSerializer when a user records a transaction manually — either way,
recording an Income or Expense always posts a balanced two-line JournalEntry
alongside it.
"""

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils import timezone

from .models import Account, CashBankAccount, Income, JournalEntry, JournalLine

# Auto-created the first time an auto-pulled Income entry needs them. Money
# lands here as "received but not yet deposited/reconciled to a real bank
# account" — see docs/spec.md Module 10 "Bank Reconciliation" (not built yet).
DEFAULT_INCOME_ACCOUNT_CODE = '4000'
DEFAULT_UNDEPOSITED_FUNDS_CODE = '1000'


def post_journal_entry(
    *, date, memo, source, debit_account, credit_account, amount, created_by=None, source_object=None,
):
    content_type = ContentType.objects.get_for_model(source_object) if source_object else None
    object_id = str(source_object.pk) if source_object else ''

    with transaction.atomic():
        entry = JournalEntry.objects.create(
            date=date, memo=memo, source=source, status=JournalEntry.Status.POSTED, posted_at=timezone.now(),
            created_by=created_by, content_type=content_type, object_id=object_id,
        )
        JournalLine.objects.create(journal_entry=entry, account=debit_account, debit=amount)
        JournalLine.objects.create(journal_entry=entry, account=credit_account, credit=amount)

    return entry


def _default_income_account():
    account, _ = Account.objects.get_or_create(
        code=DEFAULT_INCOME_ACCOUNT_CODE,
        defaults={'name': 'Sales & Installment Income', 'type': Account.Type.INCOME},
    )
    return account


def _default_deposit_account():
    cash_bank_account = CashBankAccount.objects.filter(name='Undeposited Funds').first()
    if cash_bank_account:
        return cash_bank_account
    account, _ = Account.objects.get_or_create(
        code=DEFAULT_UNDEPOSITED_FUNDS_CODE,
        defaults={'name': 'Undeposited Funds', 'type': Account.Type.ASSET},
    )
    return CashBankAccount.objects.create(name='Undeposited Funds', kind=CashBankAccount.Kind.CASH, account=account)


def record_income(*, source, source_object, amount, date, description, recorded_by=None):
    """
    Idempotent per source_object — Income's unique constraint on
    (content_type, object_id) is what actually enforces this; get_or_create
    just turns a repeat call (e.g. a retried signal) into a no-op read
    instead of an IntegrityError.
    """
    content_type = ContentType.objects.get_for_model(source_object)

    with transaction.atomic():
        income, created = Income.objects.get_or_create(
            content_type=content_type,
            object_id=str(source_object.pk),
            defaults={
                'account': _default_income_account(),
                'deposit_to': _default_deposit_account(),
                'amount': amount,
                'date': date,
                'source': source,
                'description': description,
                'recorded_by': recorded_by,
            },
        )
        if not created:
            return income

        entry_source = JournalEntry.Source.SALE if source == Income.Source.SALE else JournalEntry.Source.INSTALLMENT
        entry = post_journal_entry(
            date=income.date, memo=description, source=entry_source,
            debit_account=income.deposit_to.account, credit_account=income.account, amount=income.amount,
            created_by=recorded_by, source_object=source_object,
        )
        income.journal_entry = entry
        income.save(update_fields=['journal_entry', 'updated_at'])

    return income
