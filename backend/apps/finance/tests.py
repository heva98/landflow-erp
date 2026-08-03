from datetime import timedelta
from decimal import Decimal

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.crm.models import Customer
from apps.installments.models import Installment, InstallmentPayment, PaymentPlan
from apps.plots.models import Plot
from apps.projects.models import Project
from apps.sales.models import Receipt, Sale

from . import services
from .models import Account, Budget, BudgetLine, CashBankAccount, Income, JournalEntry, JournalLine


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def finance_manager_role(db):
    return Role.objects.get(name='Finance Manager')


@pytest.fixture
def cashier_role(db):
    return Role.objects.get(name='Cashier')


@pytest.fixture
def sales_manager_role(db):
    return Role.objects.get(name='Sales Manager')


@pytest.fixture
def customer_role(db):
    return Role.objects.get(name='Customer')


@pytest.fixture
def finance_manager(db, finance_manager_role):
    return User.objects.create_user(email='finance@landflow.co.tz', password='s3cure-pass', role=finance_manager_role)


@pytest.fixture
def cashier(db, cashier_role):
    return User.objects.create_user(email='cashier@landflow.co.tz', password='s3cure-pass', role=cashier_role)


@pytest.fixture
def sales_manager(db, sales_manager_role):
    return User.objects.create_user(email='salesmgr@landflow.co.tz', password='s3cure-pass', role=sales_manager_role)


@pytest.fixture
def customer_user(db, customer_role):
    return User.objects.create_user(email='customer@landflow.co.tz', password='s3cure-pass', role=customer_role)


@pytest.fixture
def cash_account(db):
    return Account.objects.create(code='1000', name='Cash on Hand', type=Account.Type.ASSET)


@pytest.fixture
def income_account(db):
    return Account.objects.create(code='4000', name='Sales Income', type=Account.Type.INCOME)


@pytest.fixture
def expense_account(db):
    return Account.objects.create(code='5000', name='Office Supplies', type=Account.Type.EXPENSE)


@pytest.fixture
def cash_bank_account(db, cash_account):
    return CashBankAccount.objects.create(name='Main Cash Drawer', kind=CashBankAccount.Kind.CASH, account=cash_account)


@pytest.fixture
def project(db):
    return Project.objects.create(
        name='Buyuni Phase II', location='Buyuni, Dar es Salaam', total_area_sqm=Decimal('50000.00'),
    )


@pytest.fixture
def plot(db, project):
    return Plot.objects.create(
        project=project, plot_number='A-01', area_sqm=Decimal('500.00'), price=Decimal('20000000.00'),
        status=Plot.Status.SOLD,
    )


@pytest.fixture
def customer(db):
    return Customer.objects.create(full_name='Juma Hassan', phone='+255700000000')


@pytest.fixture
def sale(db, plot, customer):
    return Sale.objects.create(
        plot=plot, customer=customer, sale_type=Sale.SaleType.INSTALLMENT,
        sale_price=Decimal('12000000.00'), down_payment=Decimal('2000000.00'),
    )


@pytest.fixture
def payment_plan(db, sale):
    plan = PaymentPlan.objects.create(
        sale=sale, principal_amount=Decimal('10000000.00'), number_of_installments=4,
        installment_amount=Decimal('2500000.00'), start_date=timezone.localdate() + timedelta(days=30),
    )
    plan.generate_schedule()
    return plan


# --- model behaviour -------------------------------------------------------

@pytest.mark.django_db
def test_account_str_includes_code_and_name(cash_account):
    assert str(cash_account) == '1000 - Cash on Hand'


@pytest.mark.django_db
def test_cash_bank_account_balance_reflects_posted_lines(cash_bank_account, income_account):
    entry = JournalEntry.objects.create(status=JournalEntry.Status.POSTED)
    JournalLine.objects.create(journal_entry=entry, account=cash_bank_account.account, debit=Decimal('1000.00'))
    JournalLine.objects.create(journal_entry=entry, account=income_account, credit=Decimal('1000.00'))

    assert cash_bank_account.balance == Decimal('1000.00')


@pytest.mark.django_db
def test_cash_bank_account_balance_ignores_draft_entries(cash_bank_account, income_account):
    entry = JournalEntry.objects.create(status=JournalEntry.Status.DRAFT)
    JournalLine.objects.create(journal_entry=entry, account=cash_bank_account.account, debit=Decimal('1000.00'))
    JournalLine.objects.create(journal_entry=entry, account=income_account, credit=Decimal('1000.00'))

    assert cash_bank_account.balance == Decimal('0')


@pytest.mark.django_db
def test_journal_entry_is_balanced_property(cash_account, income_account):
    entry = JournalEntry.objects.create()
    JournalLine.objects.create(journal_entry=entry, account=cash_account, debit=Decimal('500.00'))
    assert entry.is_balanced is False

    JournalLine.objects.create(journal_entry=entry, account=income_account, credit=Decimal('500.00'))
    assert entry.is_balanced is True


@pytest.mark.django_db
def test_budget_line_actual_amount_and_variance(expense_account, cash_bank_account):
    budget = Budget.objects.create(
        name='Q1 Budget', period_start=timezone.localdate() - timedelta(days=10),
        period_end=timezone.localdate() + timedelta(days=10),
    )
    line = BudgetLine.objects.create(budget=budget, account=expense_account, amount=Decimal('100000.00'))

    entry = JournalEntry.objects.create(status=JournalEntry.Status.POSTED)
    JournalLine.objects.create(journal_entry=entry, account=expense_account, debit=Decimal('60000.00'))
    JournalLine.objects.create(journal_entry=entry, account=cash_bank_account.account, credit=Decimal('60000.00'))

    assert line.actual_amount == Decimal('60000.00')
    assert line.variance == Decimal('40000.00')


# --- auto-pull from sales / installments -----------------------------------

@pytest.mark.django_db
def test_receipt_creation_auto_posts_income(sale):
    receipt = Receipt.objects.create(
        sale=sale, amount=Decimal('2000000.00'), payment_method=Receipt.PaymentMethod.CASH,
    )

    income = Income.objects.get(source=Income.Source.SALE)
    assert income.amount == Decimal('2000000.00')
    assert income.journal_entry is not None
    assert income.journal_entry.status == JournalEntry.Status.POSTED
    assert income.journal_entry.is_balanced

    assert income.content_type.model == 'receipt'
    assert income.object_id == str(receipt.pk)


@pytest.mark.django_db
def test_auto_pull_does_not_collide_with_user_accounts_using_the_same_codes(sale):
    # '1000'/'4000' are exactly the codes a real chart of accounts would pick
    # for its own Cash/Income accounts, so the default-account bootstrapping
    # must not match on code alone — see services._get_or_create_account.
    unrelated_asset = Account.objects.create(code='1000', name='Petty Cash Drawer', type=Account.Type.ASSET)
    unrelated_income = Account.objects.create(code='4000', name='Consulting Income', type=Account.Type.INCOME)

    receipt = Receipt.objects.create(
        sale=sale, amount=Decimal('2000000.00'), payment_method=Receipt.PaymentMethod.CASH,
    )

    income = Income.objects.get(object_id=str(receipt.pk))
    assert income.deposit_to.account_id != unrelated_asset.id
    assert income.account_id != unrelated_income.id
    assert income.deposit_to.name == 'Undeposited Funds'
    assert income.account.name == 'Sales & Installment Income'


@pytest.mark.django_db
def test_installment_payment_creation_auto_posts_income(payment_plan):
    first = payment_plan.installments.get(sequence=1)
    payment = InstallmentPayment.objects.create(installment=first, amount=Decimal('2500000.00'), method='cash')

    income = Income.objects.get(source=Income.Source.INSTALLMENT)
    assert income.amount == Decimal('2500000.00')
    assert income.object_id == str(payment.pk)
    assert income.journal_entry.is_balanced


@pytest.mark.django_db
def test_record_income_is_idempotent_per_source_object(sale):
    receipt = Receipt.objects.create(
        sale=sale, amount=Decimal('2000000.00'), payment_method=Receipt.PaymentMethod.CASH,
    )
    assert Income.objects.filter(object_id=str(receipt.pk)).count() == 1

    # A repeat call (e.g. a retried signal) must not create a duplicate or a
    # second journal entry.
    services.record_income(
        source=Income.Source.SALE, source_object=receipt, amount=receipt.amount,
        date=receipt.received_at.date(), description='retry',
    )
    assert Income.objects.filter(object_id=str(receipt.pk)).count() == 1
    assert JournalEntry.objects.filter(object_id=str(receipt.pk)).count() == 1


# --- API: auth & permissions ------------------------------------------------

@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('account-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, customer_user):
    api_client.force_authenticate(user=customer_user)
    response = api_client.get(reverse('account-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_viewer_role_can_view_but_not_create(api_client, sales_manager, cash_account):
    api_client.force_authenticate(user=sales_manager)
    response = api_client.get(reverse('account-list'))
    assert response.status_code == status.HTTP_200_OK

    response = api_client.post(reverse('account-list'), {'code': '9999', 'name': 'New', 'type': 'asset'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_cashier_cannot_create_journal_entry(api_client, cashier, cash_account, income_account):
    api_client.force_authenticate(user=cashier)
    response = api_client.post(reverse('journalentry-list'), {
        'lines': [
            {'account': str(cash_account.id), 'debit': '100.00', 'credit': '0'},
            {'account': str(income_account.id), 'debit': '0', 'credit': '100.00'},
        ],
    }, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN


# --- API: journal entries ---------------------------------------------------

@pytest.mark.django_db
def test_create_journal_entry_rejects_unbalanced_lines(api_client, finance_manager, cash_account, income_account):
    api_client.force_authenticate(user=finance_manager)
    response = api_client.post(reverse('journalentry-list'), {
        'memo': 'Unbalanced test',
        'lines': [
            {'account': str(cash_account.id), 'debit': '100.00', 'credit': '0'},
            {'account': str(income_account.id), 'debit': '0', 'credit': '50.00'},
        ],
    }, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_create_and_post_journal_entry(api_client, finance_manager, cash_account, income_account):
    api_client.force_authenticate(user=finance_manager)
    create_response = api_client.post(reverse('journalentry-list'), {
        'memo': 'Manual entry',
        'lines': [
            {'account': str(cash_account.id), 'debit': '1000.00', 'credit': '0'},
            {'account': str(income_account.id), 'debit': '0', 'credit': '1000.00'},
        ],
    }, format='json')
    assert create_response.status_code == status.HTTP_201_CREATED, create_response.data
    assert create_response.data['status'] == 'draft'
    entry_id = create_response.data['id']

    post_response = api_client.post(reverse('journalentry-post-entry', args=[entry_id]))
    assert post_response.status_code == status.HTTP_200_OK, post_response.data
    assert post_response.data['status'] == 'posted'

    # Posting twice is rejected.
    second_post = api_client.post(reverse('journalentry-post-entry', args=[entry_id]))
    assert second_post.status_code == status.HTTP_400_BAD_REQUEST


# --- API: income / expense --------------------------------------------------

@pytest.mark.django_db
def test_create_income_manual_posts_journal_entry(api_client, cashier, income_account, cash_bank_account):
    api_client.force_authenticate(user=cashier)
    response = api_client.post(reverse('income-list'), {
        'account': str(income_account.id), 'deposit_to': str(cash_bank_account.id),
        'amount': '50000.00', 'description': 'Rent income',
    })
    assert response.status_code == status.HTTP_201_CREATED, response.data
    assert response.data['source'] == 'other'
    assert response.data['journal_entry_number'] is not None

    cash_bank_account.refresh_from_db()
    assert cash_bank_account.balance == Decimal('50000.00')


@pytest.mark.django_db
def test_create_expense_manual_posts_journal_entry(api_client, cashier, expense_account, cash_bank_account):
    entry = JournalEntry.objects.create(status=JournalEntry.Status.POSTED)
    JournalLine.objects.create(journal_entry=entry, account=cash_bank_account.account, debit=Decimal('200000.00'))
    JournalLine.objects.create(journal_entry=entry, account=expense_account, credit=Decimal('200000.00'))

    api_client.force_authenticate(user=cashier)
    response = api_client.post(reverse('expense-list'), {
        'account': str(expense_account.id), 'paid_from': str(cash_bank_account.id),
        'amount': '30000.00', 'payee': 'Office World',
    })
    assert response.status_code == status.HTTP_201_CREATED, response.data

    cash_bank_account.refresh_from_db()
    assert cash_bank_account.balance == Decimal('170000.00')


@pytest.mark.django_db
def test_create_income_rejects_zero_amount(api_client, cashier, income_account, cash_bank_account):
    api_client.force_authenticate(user=cashier)
    response = api_client.post(reverse('income-list'), {
        'account': str(income_account.id), 'deposit_to': str(cash_bank_account.id), 'amount': '0',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# --- API: budgets ------------------------------------------------------------

@pytest.mark.django_db
def test_create_budget_with_lines(api_client, finance_manager, expense_account):
    api_client.force_authenticate(user=finance_manager)
    response = api_client.post(reverse('budget-list'), {
        'name': 'Q1 Budget', 'period_start': '2026-01-01', 'period_end': '2026-03-31',
        'lines': [{'account': str(expense_account.id), 'amount': '500000.00'}],
    }, format='json')
    assert response.status_code == status.HTTP_201_CREATED, response.data
    assert len(response.data['lines']) == 1
    assert response.data['lines'][0]['actual_amount'] == Decimal('0')


@pytest.mark.django_db
def test_create_budget_rejects_duplicate_account_lines(api_client, finance_manager, expense_account):
    api_client.force_authenticate(user=finance_manager)
    response = api_client.post(reverse('budget-list'), {
        'name': 'Q1 Budget', 'period_start': '2026-01-01', 'period_end': '2026-03-31',
        'lines': [
            {'account': str(expense_account.id), 'amount': '500000.00'},
            {'account': str(expense_account.id), 'amount': '100000.00'},
        ],
    }, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# --- reports -----------------------------------------------------------------

@pytest.mark.django_db
def test_profit_and_loss_report(api_client, finance_manager, income_account, expense_account, cash_bank_account):
    today = timezone.localdate()
    services.post_journal_entry(
        date=today, memo='income', source=JournalEntry.Source.MANUAL,
        debit_account=cash_bank_account.account, credit_account=income_account, amount=Decimal('100000.00'),
    )
    services.post_journal_entry(
        date=today, memo='expense', source=JournalEntry.Source.MANUAL,
        debit_account=expense_account, credit_account=cash_bank_account.account, amount=Decimal('40000.00'),
    )

    api_client.force_authenticate(user=finance_manager)
    response = api_client.get(reverse('finance-report-profit-and-loss'), {
        'date_from': today.isoformat(), 'date_to': today.isoformat(),
    })
    assert response.status_code == status.HTTP_200_OK, response.data
    assert Decimal(response.data['total_income']) == Decimal('100000.00')
    assert Decimal(response.data['total_expense']) == Decimal('40000.00')
    assert Decimal(response.data['net_profit']) == Decimal('60000.00')


@pytest.mark.django_db
def test_cash_flow_report(api_client, finance_manager, income_account, cash_bank_account):
    today = timezone.localdate()
    services.post_journal_entry(
        date=today, memo='income', source=JournalEntry.Source.MANUAL,
        debit_account=cash_bank_account.account, credit_account=income_account, amount=Decimal('75000.00'),
    )

    api_client.force_authenticate(user=finance_manager)
    response = api_client.get(reverse('finance-report-cash-flow'), {
        'date_from': today.isoformat(), 'date_to': today.isoformat(),
    })
    assert response.status_code == status.HTTP_200_OK, response.data
    assert Decimal(response.data['total_inflow']) == Decimal('75000.00')
    assert Decimal(response.data['net_cash_flow']) == Decimal('75000.00')
    account_row = next(row for row in response.data['accounts'] if row['cash_bank_account'] == cash_bank_account.id)
    assert Decimal(account_row['closing_balance']) == Decimal('75000.00')


@pytest.mark.django_db
def test_reports_require_authentication(api_client):
    response = api_client.get(reverse('finance-report-profit-and-loss'), {
        'date_from': '2026-01-01', 'date_to': '2026-01-31',
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_reports_require_date_range(api_client, finance_manager):
    api_client.force_authenticate(user=finance_manager)
    response = api_client.get(reverse('finance-report-profit-and-loss'))
    assert response.status_code == status.HTTP_400_BAD_REQUEST
