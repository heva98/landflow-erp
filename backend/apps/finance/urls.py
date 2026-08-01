from rest_framework.routers import DefaultRouter

from .views import (
    AccountViewSet, BudgetViewSet, CashBankAccountViewSet, ExpenseViewSet, FinanceReportViewSet, IncomeViewSet,
    JournalEntryViewSet, JournalLineViewSet,
)

router = DefaultRouter()
router.register('chart-of-accounts', AccountViewSet, basename='account')
router.register('cash-bank-accounts', CashBankAccountViewSet, basename='cashbankaccount')
router.register('journal-entries', JournalEntryViewSet, basename='journalentry')
router.register('general-ledger', JournalLineViewSet, basename='journalline')
router.register('income', IncomeViewSet, basename='income')
router.register('expenses', ExpenseViewSet, basename='expense')
router.register('budgets', BudgetViewSet, basename='budget')
router.register('finance-reports', FinanceReportViewSet, basename='finance-report')

urlpatterns = router.urls
