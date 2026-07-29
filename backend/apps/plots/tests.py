from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.plots.models import Plot
from apps.projects.models import Project


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def administrator_role(db):
    return Role.objects.get(name='Administrator')


@pytest.fixture
def finance_manager_role(db):
    return Role.objects.get(name='Finance Manager')


@pytest.fixture
def sales_agent_role(db):
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def receptionist_role(db):
    # Granted view_plot (but not change_plot/set_plot_financials) in the
    # seeding migration — used below to add extra permissions ad hoc.
    return Role.objects.get(name='Receptionist')


@pytest.fixture
def customer_role(db):
    # Not granted any plot permissions in the seeding migration.
    return Role.objects.get(name='Customer')


@pytest.fixture
def admin_user(db, administrator_role):
    return User.objects.create_user(
        email='admin@landflow.co.tz', password='s3cure-pass', role=administrator_role,
    )


@pytest.fixture
def finance_manager(db, finance_manager_role):
    return User.objects.create_user(
        email='finance@landflow.co.tz', password='s3cure-pass', role=finance_manager_role,
    )


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(
        email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role,
    )


@pytest.fixture
def receptionist(db, receptionist_role):
    return User.objects.create_user(
        email='receptionist@landflow.co.tz', password='s3cure-pass', role=receptionist_role,
    )


@pytest.fixture
def customer(db, customer_role):
    return User.objects.create_user(
        email='customer@landflow.co.tz', password='s3cure-pass', role=customer_role,
    )


@pytest.fixture
def project(db):
    return Project.objects.create(
        name='Buyuni Phase II',
        location='Buyuni, Dar es Salaam',
        total_area_sqm=Decimal('50000.00'),
    )


@pytest.fixture
def plot(db, project):
    return Plot.objects.create(
        project=project,
        plot_number='A-01',
        area_sqm=Decimal('500.00'),
        price=Decimal('20000000.00'),
        discount=Decimal('1000000.00'),
    )


@pytest.mark.django_db
def test_str_includes_project_and_plot_number(plot):
    assert str(plot) == 'Buyuni Phase II - A-01'


@pytest.mark.django_db
def test_default_status_is_available(plot):
    assert plot.status == Plot.Status.AVAILABLE


@pytest.mark.django_db
def test_final_price_subtracts_discount(plot):
    assert plot.final_price == Decimal('19000000.00')


@pytest.mark.django_db
def test_plot_number_unique_per_project(project):
    Plot.objects.create(project=project, plot_number='A-01', area_sqm=Decimal('500.00'))
    with pytest.raises(Exception):
        Plot.objects.create(project=project, plot_number='A-01', area_sqm=Decimal('600.00'))


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('plot-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_sales_agent_can_list_plots(api_client, agent, plot):
    # Sales Agent is seeded with view_plot.
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('plot-list'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, customer, plot):
    api_client.force_authenticate(user=customer)
    response = api_client.get(reverse('plot-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_administrator_can_create_plot(api_client, admin_user, project):
    api_client.force_authenticate(user=admin_user)
    response = api_client.post(reverse('plot-list'), {
        'project': str(project.id),
        'plot_number': 'B-02',
        'area_sqm': '450.00',
        'price': '15000000.00',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert Plot.objects.filter(plot_number='B-02').exists()


@pytest.mark.django_db
def test_filter_by_project(api_client, admin_user, plot):
    other_project = Project.objects.create(
        name='Kigamboni Estate', location='Kigamboni', total_area_sqm=Decimal('10000.00'),
    )
    Plot.objects.create(project=other_project, plot_number='C-01', area_sqm=Decimal('300.00'))
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('plot-list'), {'project': str(plot.project_id)})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['plot_number'] == 'A-01'


@pytest.mark.django_db
def test_filter_by_status(api_client, admin_user, plot):
    Plot.objects.create(
        project=plot.project, plot_number='A-02', area_sqm=Decimal('500.00'), status=Plot.Status.SOLD,
    )
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('plot-list'), {'status': 'sold'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['plot_number'] == 'A-02'


@pytest.mark.django_db
def test_filter_by_price_range(api_client, admin_user, plot):
    Plot.objects.create(
        project=plot.project, plot_number='A-03', area_sqm=Decimal('500.00'), price=Decimal('5000000.00'),
    )
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('plot-list'), {'min_price': '10000000'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['plot_number'] == 'A-01'


@pytest.mark.django_db
def test_administrator_sees_and_can_set_financial_fields(api_client, admin_user, plot):
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('plot-detail', args=[plot.id]))
    assert response.data['price'] == '20000000.00'
    assert response.data['final_price'] == '19000000.00'

    response = api_client.patch(reverse('plot-detail', args=[plot.id]), {'price': '25000000.00'})
    assert response.status_code == status.HTTP_200_OK
    plot.refresh_from_db()
    assert plot.price == Decimal('25000000.00')


@pytest.mark.django_db
def test_finance_manager_can_set_financial_fields(api_client, finance_manager, plot):
    api_client.force_authenticate(user=finance_manager)
    response = api_client.patch(reverse('plot-detail', args=[plot.id]), {'price': '30000000.00'})
    assert response.status_code == status.HTTP_200_OK
    plot.refresh_from_db()
    assert plot.price == Decimal('30000000.00')


@pytest.mark.django_db
def test_sales_agent_cannot_edit_plot_at_all(api_client, agent, plot):
    # Sales Agent only has view_plot, so PATCH is rejected before the
    # serializer's own financial-field restriction is even reached.
    api_client.force_authenticate(user=agent)

    response = api_client.get(reverse('plot-detail', args=[plot.id]))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['price'] == '20000000.00'

    response = api_client.patch(reverse('plot-detail', args=[plot.id]), {'status': 'reserved'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_role_with_edit_access_but_no_financials_permission_cannot_set_price(api_client, receptionist_role, receptionist, plot):
    # Simulates a future role (e.g. Surveyor) that can edit plot details
    # without being able to touch price/discount: the serializer must ignore
    # those fields even though DjangoModelPermissions lets the PATCH through.
    from django.contrib.auth.models import Permission

    change_perm = Permission.objects.get(content_type__app_label='plots', codename='change_plot')
    view_perm = Permission.objects.get(content_type__app_label='plots', codename='view_plot')
    receptionist_role.permissions.add(change_perm, view_perm)

    api_client.force_authenticate(user=receptionist)
    response = api_client.patch(reverse('plot-detail', args=[plot.id]), {
        'status': 'reserved', 'price': '1.00', 'discount': '1.00',
    })
    assert response.status_code == status.HTTP_200_OK
    plot.refresh_from_db()
    assert plot.status == Plot.Status.RESERVED
    assert plot.price == Decimal('20000000.00')
    assert plot.discount == Decimal('1000000.00')


@pytest.mark.django_db
def test_sales_manager_can_edit_plot_and_set_financials(api_client, project):
    sales_manager_role = Role.objects.get(name='Sales Manager')
    sales_manager = User.objects.create_user(
        email='salesmgr@landflow.co.tz', password='s3cure-pass', role=sales_manager_role,
    )
    plot = Plot.objects.create(project=project, plot_number='D-01', area_sqm=Decimal('400.00'))
    api_client.force_authenticate(user=sales_manager)
    response = api_client.patch(reverse('plot-detail', args=[plot.id]), {
        'status': 'reserved', 'price': '12000000.00',
    })
    assert response.status_code == status.HTTP_200_OK
    plot.refresh_from_db()
    assert plot.status == Plot.Status.RESERVED
    assert plot.price == Decimal('12000000.00')
