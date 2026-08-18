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
def sales_manager_role(db):
    return Role.objects.get(name='Sales Manager')


@pytest.fixture
def sales_manager(db, sales_manager_role):
    return User.objects.create_user(email='salesmgr@landflow.co.tz', password='s3cure-pass', role=sales_manager_role)


@pytest.fixture
def customer_role(db):
    # Not granted plots/projects view permissions in any seeding migration.
    return Role.objects.get(name='Customer')


@pytest.fixture
def customer_user(db, customer_role):
    return User.objects.create_user(email='customer@landflow.co.tz', password='s3cure-pass', role=customer_role)


@pytest.fixture
def selling_project(db):
    return Project.objects.create(
        name='Buyuni Phase II', location='Buyuni, Dar es Salaam', total_area_sqm=Decimal('10000.00'),
        status=Project.Status.SELLING,
    )


@pytest.fixture
def planning_project(db):
    return Project.objects.create(
        name='Kigamboni Extension', location='Kigamboni, Dar es Salaam', total_area_sqm=Decimal('20000.00'),
        status=Project.Status.PLANNING, start_date='2027-01-01',
    )


@pytest.fixture
def plots(db, selling_project):
    Plot.objects.create(
        project=selling_project, plot_number='A-01', area_sqm=Decimal('500.00'), price=Decimal('20000000.00'),
        status=Plot.Status.AVAILABLE,
    )
    Plot.objects.create(
        project=selling_project, plot_number='A-02', area_sqm=Decimal('600.00'), price=Decimal('22000000.00'),
        status=Plot.Status.RESERVED,
    )
    Plot.objects.create(
        project=selling_project, plot_number='A-03', area_sqm=Decimal('700.00'), price=Decimal('25000000.00'),
        status=Plot.Status.TRANSFERRED,
    )
    Plot.objects.create(
        project=selling_project, plot_number='A-04', area_sqm=Decimal('800.00'), price=Decimal('28000000.00'),
        status=Plot.Status.SOLD,
    )


@pytest.mark.django_db
def test_unsold_requires_authentication(api_client):
    response = api_client.get(reverse('inventory-unsold'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, customer_user, plots):
    api_client.force_authenticate(user=customer_user)
    response = api_client.get(reverse('inventory-unsold'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_unsold_returns_only_available_plots(api_client, sales_manager, plots):
    api_client.force_authenticate(user=sales_manager)
    response = api_client.get(reverse('inventory-unsold'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['summary']['count'] == 1
    assert Decimal(response.data['summary']['total_area_sqm']) == Decimal('500.00')
    assert response.data['rows'][0]['plot_number'] == 'A-01'


@pytest.mark.django_db
def test_reserved_returns_only_reserved_plots(api_client, sales_manager, plots):
    api_client.force_authenticate(user=sales_manager)
    response = api_client.get(reverse('inventory-reserved'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['summary']['count'] == 1
    assert response.data['rows'][0]['plot_number'] == 'A-02'


@pytest.mark.django_db
def test_transferred_returns_only_transferred_plots(api_client, sales_manager, plots):
    api_client.force_authenticate(user=sales_manager)
    response = api_client.get(reverse('inventory-transferred'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['summary']['count'] == 1
    assert response.data['rows'][0]['plot_number'] == 'A-03'


@pytest.mark.django_db
def test_project_filter_scopes_results(api_client, sales_manager, plots, selling_project):
    other_project = Project.objects.create(
        name='Other Project', location='Elsewhere', total_area_sqm=Decimal('5000.00'),
    )
    Plot.objects.create(
        project=other_project, plot_number='B-01', area_sqm=Decimal('300.00'), status=Plot.Status.AVAILABLE,
    )
    api_client.force_authenticate(user=sales_manager)

    response = api_client.get(reverse('inventory-unsold'), {'project': str(selling_project.id)})
    assert response.data['summary']['count'] == 1
    assert response.data['rows'][0]['plot_number'] == 'A-01'


@pytest.mark.django_db
def test_available_area_grouped_by_project(api_client, sales_manager, plots, selling_project):
    api_client.force_authenticate(user=sales_manager)
    response = api_client.get(reverse('inventory-available-area'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['summary']['count'] == 1
    assert Decimal(response.data['summary']['total_area_sqm']) == Decimal('500.00')
    assert response.data['rows'][0]['project'] == selling_project.name
    assert response.data['rows'][0]['available_plot_count'] == 1


@pytest.mark.django_db
def test_future_projects_excludes_selling_project(api_client, sales_manager, selling_project, planning_project):
    api_client.force_authenticate(user=sales_manager)
    response = api_client.get(reverse('inventory-future-projects'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['summary']['count'] == 1
    assert response.data['rows'][0]['project'] == planning_project.name


@pytest.mark.django_db
def test_overview_combines_all_sections(api_client, sales_manager, plots, planning_project):
    api_client.force_authenticate(user=sales_manager)
    response = api_client.get(reverse('inventory-overview'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['unsold']['count'] == 1
    assert response.data['reserved']['count'] == 1
    assert response.data['transferred']['count'] == 1
    assert response.data['future_projects_count'] == 1
