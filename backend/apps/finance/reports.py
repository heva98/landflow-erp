"""
Profit & Loss and Cash Flow are computed on the fly from posted JournalLines
— there's no stored report model, they're just aggregations over the
general ledger for a date range.
"""

from decimal import Decimal

from django.db.models import Sum

from .models import Account, CashBankAccount, JournalEntry, JournalLine


def profit_and_loss(date_from, date_to):
    lines = JournalLine.objects.filter(
        journal_entry__status=JournalEntry.Status.POSTED,
        journal_entry__date__gte=date_from, journal_entry__date__lte=date_to,
        account__type__in=[Account.Type.INCOME, Account.Type.EXPENSE],
    ).values('account', 'account__code', 'account__name', 'account__type').annotate(
        debit=Sum('debit'), credit=Sum('credit'),
    )

    income_lines, expense_lines = [], []
    total_income = total_expense = Decimal('0')

    for row in lines:
        debit = row['debit'] or Decimal('0')
        credit = row['credit'] or Decimal('0')
        entry = {'account': row['account'], 'code': row['account__code'], 'name': row['account__name']}
        if row['account__type'] == Account.Type.INCOME:
            entry['amount'] = credit - debit
            total_income += entry['amount']
            income_lines.append(entry)
        else:
            entry['amount'] = debit - credit
            total_expense += entry['amount']
            expense_lines.append(entry)

    return {
        'date_from': date_from,
        'date_to': date_to,
        'income': income_lines,
        'total_income': total_income,
        'expenses': expense_lines,
        'total_expense': total_expense,
        'net_profit': total_income - total_expense,
    }


def cash_flow(date_from, date_to):
    accounts = []
    total_inflow = total_outflow = Decimal('0')

    for cash_bank_account in CashBankAccount.objects.select_related('account').filter(is_active=True):
        opening_totals = cash_bank_account.account.journal_lines.filter(
            journal_entry__status=JournalEntry.Status.POSTED, journal_entry__date__lt=date_from,
        ).aggregate(debit=Sum('debit'), credit=Sum('credit'))
        opening_balance = (
            cash_bank_account.opening_balance
            + (opening_totals['debit'] or Decimal('0'))
            - (opening_totals['credit'] or Decimal('0'))
        )

        period_totals = cash_bank_account.account.journal_lines.filter(
            journal_entry__status=JournalEntry.Status.POSTED,
            journal_entry__date__gte=date_from, journal_entry__date__lte=date_to,
        ).aggregate(debit=Sum('debit'), credit=Sum('credit'))
        inflow = period_totals['debit'] or Decimal('0')
        outflow = period_totals['credit'] or Decimal('0')
        total_inflow += inflow
        total_outflow += outflow

        accounts.append({
            'cash_bank_account': cash_bank_account.id,
            'name': cash_bank_account.name,
            'kind': cash_bank_account.kind,
            'opening_balance': opening_balance,
            'inflow': inflow,
            'outflow': outflow,
            'closing_balance': opening_balance + inflow - outflow,
        })

    return {
        'date_from': date_from,
        'date_to': date_to,
        'accounts': accounts,
        'total_inflow': total_inflow,
        'total_outflow': total_outflow,
        'net_cash_flow': total_inflow - total_outflow,
    }
