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

from .models import Reservation
from .tasks import expire_overdue_reservations


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def administrator_role(db):
    return Role.objects.get(name='Administrator')


@pytest.fixture
def sales_agent_role(db):
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def finance_manager_role(db):
    # Granted view-only access to reservations in the seeding migration.
    return Role.objects.get(name='Finance Manager')


@pytest.fixture
def customer_role(db):
    # Not granted any reservation permissions in the seeding migration.
    return Role.objects.get(name='Customer')


@pytest.fixture
def admin_user(db, administrator_role):
    return User.objects.create_user(
        email='admin@landflow.co.tz', password='s3cure-pass', role=administrator_role,
    )


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(
        email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role,
    )


@pytest.fixture
def finance_manager(db, finance_manager_role):
    return User.objects.create_user(
        email='finance@landflow.co.tz', password='s3cure-pass', role=finance_manager_role,
    )


@pytest.fixture
def customer_user(db, customer_role):
    return User.objects.create_user(
        email='customer@landflow.co.tz', password='s3cure-pass', role=customer_role,
    )


@pytest.fixture
def project(db):
    return Project.objects.create(
        name='Buyuni Phase II', location='Buyuni, Dar es Salaam', total_area_sqm=Decimal('50000.00'),
    )


@pytest.fixture
def plot(db, project):
    return Plot.objects.create(
        project=project, plot_number='A-01', area_sqm=Decimal('500.00'), price=Decimal('20000000.00'),
    )


@pytest.fixture
def customer(db):
    return Customer.objects.create(full_name='Juma Hassan', phone='+255700000000')


@pytest.fixture
def reservation(db, plot, customer):
    plot.status = Plot.Status.RESERVED
    plot.save(update_fields=['status'])
    return Reservation.objects.create(
        plot=plot, customer=customer, reservation_fee=Decimal('100000.00'),
        expiry_date=timezone.now() + timedelta(days=7),
    )


@pytest.mark.django_db
def test_str_includes_plot_and_customer(reservation):
    assert str(reservation) == 'Buyuni Phase II - A-01 reserved for Juma Hassan (Active)'


@pytest.mark.django_db
def test_default_status_is_active(reservation):
    assert reservation.status == Reservation.Status.ACTIVE


@pytest.mark.django_db
def test_is_expired_false_before_expiry(reservation):
    assert reservation.is_expired is False


@pytest.mark.django_db
def test_is_expired_true_past_expiry(reservation):
    reservation.expiry_date = timezone.now() - timedelta(days=1)
    reservation.save(update_fields=['expiry_date'])
    assert reservation.is_expired is True


@pytest.mark.django_db
def test_only_one_active_reservation_per_plot(plot, customer):
    plot.status = Plot.Status.RESERVED
    plot.save(update_fields=['status'])
    Reservation.objects.create(
        plot=plot, customer=customer, reservation_fee=Decimal('50000.00'),
        expiry_date=timezone.now() + timedelta(days=3),
    )
    with pytest.raises(Exception):
        Reservation.objects.create(
            plot=plot, customer=customer, reservation_fee=Decimal('50000.00'),
            expiry_date=timezone.now() + timedelta(days=3),
        )


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('reservation-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, customer_user, reservation):
    api_client.force_authenticate(user=customer_user)
    response = api_client.get(reverse('reservation-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_finance_manager_can_view_but_not_create(api_client, finance_manager, reservation, plot, customer):
    api_client.force_authenticate(user=finance_manager)
    response = api_client.get(reverse('reservation-list'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1

    response = api_client.post(reverse('reservation-list'), {
        'plot': str(plot.id), 'customer': str(customer.id),
        'reservation_fee': '10000.00',
        'expiry_date': (timezone.now() + timedelta(days=1)).isoformat(),
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_agent_can_reserve_available_plot(api_client, agent, plot, customer):
    api_client.force_authenticate(user=agent)
    response = api_client.post(reverse('reservation-list'), {
        'plot': str(plot.id), 'customer': str(customer.id),
        'reservation_fee': '150000.00',
        'expiry_date': (timezone.now() + timedelta(days=5)).isoformat(),
    })
    assert response.status_code == status.HTTP_201_CREATED
    plot.refresh_from_db()
    assert plot.status == Plot.Status.RESERVED


@pytest.mark.django_db
def test_cannot_reserve_a_plot_that_is_not_available(api_client, agent, plot, customer):
    plot.status = Plot.Status.SOLD
    plot.save(update_fields=['status'])
    api_client.force_authenticate(user=agent)
    response = api_client.post(reverse('reservation-list'), {
        'plot': str(plot.id), 'customer': str(customer.id),
        'reservation_fee': '150000.00',
        'expiry_date': (timezone.now() + timedelta(days=5)).isoformat(),
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_convert_marks_reservation_converted_and_plot_sold(api_client, agent, reservation, plot):
    api_client.force_authenticate(user=agent)
    response = api_client.post(reverse('reservation-convert', args=[reservation.id]))
    assert response.status_code == status.HTTP_200_OK
    reservation.refresh_from_db()
    plot.refresh_from_db()
    assert reservation.status == Reservation.Status.CONVERTED
    assert reservation.converted_at is not None
    assert plot.status == Plot.Status.SOLD


@pytest.mark.django_db
def test_convert_rejects_non_active_reservation(api_client, agent, reservation):
    reservation.status = Reservation.Status.CANCELLED
    reservation.save(update_fields=['status'])
    api_client.force_authenticate(user=agent)
    response = api_client.post(reverse('reservation-convert', args=[reservation.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_cancel_marks_reservation_cancelled_and_plot_available(api_client, agent, reservation, plot):
    api_client.force_authenticate(user=agent)
    response = api_client.post(reverse('reservation-cancel', args=[reservation.id]))
    assert response.status_code == status.HTTP_200_OK
    reservation.refresh_from_db()
    plot.refresh_from_db()
    assert reservation.status == Reservation.Status.CANCELLED
    assert reservation.cancelled_at is not None
    assert plot.status == Plot.Status.AVAILABLE


@pytest.mark.django_db
def test_expire_overdue_reservations_task(reservation, plot):
    reservation.expiry_date = timezone.now() - timedelta(days=1)
    reservation.save(update_fields=['expiry_date'])

    expired_count = expire_overdue_reservations()

    reservation.refresh_from_db()
    plot.refresh_from_db()
    assert expired_count == 1
    assert reservation.status == Reservation.Status.EXPIRED
    assert plot.status == Plot.Status.AVAILABLE


@pytest.mark.django_db
def test_expire_task_ignores_reservations_not_yet_due(reservation, plot):
    expired_count = expire_overdue_reservations()

    reservation.refresh_from_db()
    plot.refresh_from_db()
    assert expired_count == 0
    assert reservation.status == Reservation.Status.ACTIVE
    assert plot.status == Plot.Status.RESERVED
