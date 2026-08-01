from django.apps import AppConfig


class FinanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.finance'
    label = 'finance'

    def ready(self):
        from apps.core.audit import register_for_audit

        from . import signals
        from .models import (
            Account, Budget, BudgetLine, CashBankAccount, Expense, Income, JournalEntry, JournalLine,
        )

        register_for_audit(Account)
        register_for_audit(CashBankAccount)
        register_for_audit(JournalEntry)
        register_for_audit(JournalLine)
        register_for_audit(Income)
        register_for_audit(Expense)
        register_for_audit(Budget)
        register_for_audit(BudgetLine)

        signals.connect()
