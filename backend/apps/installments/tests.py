from datetime import timedelta
from decimal import Decimal

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.crm.models import Customer
from apps.plots.models import Plot
from apps.projects.models import Project
from apps.sales.models import Sale

from .models import Installment, PaymentPlan, _add_months
from .tasks import flag_overdue_installments


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sales_agent_role(db):
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def cashier_role(db):
    return Role.objects.get(name='Cashier')


@pytest.fixture
def crm_officer_role(db):
    return Role.objects.get(name='CRM Officer')


@pytest.fixture
def customer_role(db):
    # Not granted any installments permissions in the seeding migration.
    return Role.objects.get(name='Customer')


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role)


@pytest.fixture
def cashier(db, cashier_role):
    return User.objects.create_user(email='cashier@landflow.co.tz', password='s3cure-pass', role=cashier_role)


@pytest.fixture
def crm_officer(db, crm_officer_role):
    return User.objects.create_user(email='crm@landflow.co.tz', password='s3cure-pass', role=crm_officer_role)


@pytest.fixture
def customer_user(db, customer_role):
    return User.objects.create_user(email='customer@landflow.co.tz', password='s3cure-pass', role=customer_role)


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
def installment_sale(db, plot, customer):
    return Sale.objects.create(
        plot=plot, customer=customer, sale_type=Sale.SaleType.INSTALLMENT,
        sale_price=Decimal('12000000.00'), down_payment=Decimal('2000000.00'),
    )


@pytest.fixture
def plan_start_date():
    # Far enough in the future that none of a 4-month schedule is overdue
    # by the time flag_overdue_installments runs, unless a test says so.
    return timezone.localdate() + timedelta(days=60)


@pytest.fixture
def payment_plan(db, installment_sale, plan_start_date):
    plan = PaymentPlan.objects.create(
        sale=installment_sale, principal_amount=Decimal('10000000.00'), interest_rate=Decimal('0'),
        number_of_installments=4, installment_amount=Decimal('2500000.00'), start_date=plan_start_date,
    )
    plan.generate_schedule()
    return plan


@pytest.mark.django_db
def test_generate_schedule_creates_monthly_installments_with_remainder_on_last(payment_plan, plan_start_date):
    installments = list(payment_plan.installments.order_by('sequence'))
    assert len(installments) == 4
    assert [i.due_date for i in installments] == [_add_months(plan_start_date, n) for n in range(4)]
    assert sum(i.amount_due for i in installments) == payment_plan.total_payable
    assert all(i.status == Installment.Status.PENDING for i in installments)


@pytest.mark.django_db
def test_generate_schedule_is_not_regenerated(payment_plan):
    with pytest.raises(ValueError):
        payment_plan.generate_schedule()


@pytest.mark.django_db
def test_outstanding_balance_and_amount_paid(api_client, cashier, payment_plan):
    # Recording a payment through the API (not the ORM) matters here — the
    # installment/plan status bookkeeping lives in InstallmentPaymentSerializer.create.
    api_client.force_authenticate(user=cashier)
    first = payment_plan.installments.get(sequence=1)

    response = api_client.post(reverse('installmentpayment-list'), {
        'installment': str(first.id), 'amount': str(first.amount_due), 'method': 'cash',
    })
    assert response.status_code == status.HTTP_201_CREATED, response.data
    first.refresh_from_db()

    assert first.status == Installment.Status.PAID
    assert payment_plan.amount_paid == first.amount_due
    assert payment_plan.outstanding_balance == payment_plan.total_payable - first.amount_due


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('paymentplan-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, customer_user, payment_plan):
    api_client.force_authenticate(user=customer_user)
    response = api_client.get(reverse('paymentplan-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_viewer_role_can_view_but_not_create(api_client, crm_officer, payment_plan, installment_sale):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.get(reverse('paymentplan-list'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1

    response = api_client.post(reverse('paymentplan-list'), {
        'sale': str(installment_sale.id), 'number_of_installments': 4, 'start_date': '2026-01-01',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_create_payment_plan_derives_principal_from_sale_balance(api_client, agent, installment_sale):
    api_client.force_authenticate(user=agent)

    response = api_client.post(reverse('paymentplan-list'), {
        'sale': str(installment_sale.id), 'number_of_installments': 5,
        'start_date': '2026-01-01', 'grace_period_days': 5, 'penalty_rate': '2.00',
    })

    assert response.status_code == status.HTTP_201_CREATED, response.data
    assert Decimal(response.data['principal_amount']) == installment_sale.balance_due
    assert len(response.data['installments']) == 5


@pytest.mark.django_db
def test_create_payment_plan_rejects_cash_sale(api_client, agent, plot, customer):
    sale = Sale.objects.create(
        plot=plot, customer=customer, sale_type=Sale.SaleType.CASH,
        sale_price=Decimal('12000000.00'), down_payment=Decimal('12000000.00'),
    )
    api_client.force_authenticate(user=agent)

    response = api_client.post(reverse('paymentplan-list'), {
        'sale': str(sale.id), 'number_of_installments': 4, 'start_date': '2026-01-01',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'sale' in response.data


@pytest.mark.django_db
def test_create_payment_plan_rejects_duplicate_for_same_sale(api_client, agent, payment_plan, installment_sale):
    api_client.force_authenticate(user=agent)

    response = api_client.post(reverse('paymentplan-list'), {
        'sale': str(installment_sale.id), 'number_of_installments': 4, 'start_date': '2026-01-01',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'sale' in response.data


@pytest.mark.django_db
def test_record_payment_updates_installment_and_completes_plan(api_client, cashier, payment_plan):
    api_client.force_authenticate(user=cashier)
    installments = list(payment_plan.installments.order_by('sequence'))

    for installment in installments:
        response = api_client.post(reverse('installmentpayment-list'), {
            'installment': str(installment.id), 'amount': str(installment.amount_due), 'method': 'cash',
        })
        assert response.status_code == status.HTTP_201_CREATED, response.data

    payment_plan.refresh_from_db()
    assert payment_plan.status == PaymentPlan.Status.COMPLETED
    assert payment_plan.outstanding_balance == Decimal('0')


@pytest.mark.django_db
def test_record_payment_allows_partial_amount(api_client, cashier, payment_plan):
    api_client.force_authenticate(user=cashier)
    first = payment_plan.installments.get(sequence=1)

    response = api_client.post(reverse('installmentpayment-list'), {
        'installment': str(first.id), 'amount': '1000000.00', 'method': 'mobile_money',
    })

    assert response.status_code == status.HTTP_201_CREATED, response.data
    first.refresh_from_db()
    assert first.status == Installment.Status.PARTIAL
    assert first.amount_paid == Decimal('1000000.00')


@pytest.mark.django_db
def test_record_payment_rejects_amount_over_balance(api_client, cashier, payment_plan):
    api_client.force_authenticate(user=cashier)
    first = payment_plan.installments.get(sequence=1)

    response = api_client.post(reverse('installmentpayment-list'), {
        'installment': str(first.id), 'amount': '9999999.00', 'method': 'cash',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'amount' in response.data


@pytest.mark.django_db
def test_record_payment_rejects_already_paid_installment(api_client, cashier, payment_plan):
    api_client.force_authenticate(user=cashier)
    first = payment_plan.installments.get(sequence=1)
    api_client.post(reverse('installmentpayment-list'), {
        'installment': str(first.id), 'amount': str(first.amount_due), 'method': 'cash',
    })

    response = api_client.post(reverse('installmentpayment-list'), {
        'installment': str(first.id), 'amount': '100.00', 'method': 'cash',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_flag_overdue_installments_applies_penalty_once(payment_plan):
    payment_plan.grace_period_days = 3
    payment_plan.penalty_rate = Decimal('5.00')
    payment_plan.save(update_fields=['grace_period_days', 'penalty_rate'])

    first = payment_plan.installments.get(sequence=1)
    first.due_date = timezone.localdate() - timedelta(days=10)
    first.save(update_fields=['due_date'])

    flagged = flag_overdue_installments()
    first.refresh_from_db()

    assert flagged == 1
    assert first.status == Installment.Status.OVERDUE
    assert first.penalty_amount == first.amount_due * Decimal('5.00') / 100
    first_flagged_at = first.flagged_overdue_at

    # Running again should not re-flag it or re-charge the penalty.
    flagged_again = flag_overdue_installments()
    first.refresh_from_db()
    assert flagged_again == 0
    assert first.flagged_overdue_at == first_flagged_at


@pytest.mark.django_db
def test_flag_overdue_installments_ignores_within_grace_period(payment_plan):
    payment_plan.grace_period_days = 10
    payment_plan.save(update_fields=['grace_period_days'])

    first = payment_plan.installments.get(sequence=1)
    first.due_date = timezone.localdate() - timedelta(days=3)
    first.save(update_fields=['due_date'])

    flagged = flag_overdue_installments()
    first.refresh_from_db()

    assert flagged == 0
    assert first.status == Installment.Status.PENDING


@pytest.mark.django_db
def test_flag_overdue_installments_ignores_paid(api_client, cashier, payment_plan):
    api_client.force_authenticate(user=cashier)
    first = payment_plan.installments.get(sequence=1)
    api_client.post(reverse('installmentpayment-list'), {
        'installment': str(first.id), 'amount': str(first.amount_due), 'method': 'cash',
    })
    first.refresh_from_db()
    first.due_date = timezone.localdate() - timedelta(days=30)
    first.save(update_fields=['due_date'])

    flagged = flag_overdue_installments()
    first.refresh_from_db()

    assert flagged == 0
    assert first.status == Installment.Status.PAID
