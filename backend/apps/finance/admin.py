from django.contrib import admin

from .models import Account, Budget, BudgetLine, CashBankAccount, Expense, Income, JournalEntry, JournalLine


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'type', 'parent', 'is_active')
    list_filter = ('type', 'is_active')
    search_fields = ('code', 'name')


@admin.register(CashBankAccount)
class CashBankAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'kind', 'account', 'bank_name', 'currency', 'is_active')
    list_filter = ('kind', 'is_active')
    search_fields = ('name', 'bank_name', 'account_number')


class JournalLineInline(admin.TabularInline):
    model = JournalLine
    extra = 0


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('entry_number', 'date', 'source', 'status', 'memo')
    list_filter = ('source', 'status')
    search_fields = ('entry_number', 'memo')
    inlines = [JournalLineInline]


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('income_number', 'date', 'account', 'deposit_to', 'amount', 'source')
    list_filter = ('source', 'account')
    search_fields = ('income_number', 'description')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('expense_number', 'date', 'account', 'paid_from', 'amount', 'payee')
    list_filter = ('account',)
    search_fields = ('expense_number', 'payee', 'description')


class BudgetLineInline(admin.TabularInline):
    model = BudgetLine
    extra = 0


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'period_start', 'period_end')
    search_fields = ('name',)
    inlines = [BudgetLineInline]
