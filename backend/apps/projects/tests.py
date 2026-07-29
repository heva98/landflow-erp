from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.projects.models import Project


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sales_agent_role(db):
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def administrator_role(db):
    return Role.objects.get(name='Administrator')


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(
        email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role,
    )


@pytest.fixture
def admin_user(db, administrator_role):
    return User.objects.create_user(
        email='admin@landflow.co.tz', password='s3cure-pass', role=administrator_role,
    )


@pytest.fixture
def project(db):
    return Project.objects.create(
        name='Buyuni Phase II',
        location='Buyuni, Dar es Salaam',
        total_area_sqm=Decimal('50000.00'),
        acquisition_cost=Decimal('100000000.00'),
        development_cost=Decimal('50000000.00'),
        expected_revenue=Decimal('300000000.00'),
    )


@pytest.mark.django_db
def test_str_returns_name(project):
    assert str(project) == 'Buyuni Phase II'


@pytest.mark.django_db
def test_total_cost_sums_acquisition_and_development(project):
    assert project.total_cost == Decimal('150000000.00')


@pytest.mark.django_db
def test_roi_percent_computed_from_cost_and_revenue(project):
    assert project.roi_percent == Decimal('100.000000')


@pytest.mark.django_db
def test_roi_percent_is_none_when_cost_is_zero():
    project = Project(total_area_sqm=Decimal('1000.00'), expected_revenue=Decimal('0'))
    assert project.roi_percent is None


@pytest.mark.django_db
def test_default_status_is_planning(project):
    assert project.status == Project.Status.PLANNING


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('project-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_agent_without_permission_gets_403(api_client, agent):
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('project-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_administrator_can_list_projects(api_client, admin_user, project):
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('project-list'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_administrator_can_create_project(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    response = api_client.post(reverse('project-list'), {
        'name': 'Kigamboni Green Estate',
        'location': 'Kigamboni, Dar es Salaam',
        'total_area_sqm': '80000.00',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert Project.objects.filter(name='Kigamboni Green Estate').exists()


@pytest.mark.django_db
def test_agent_can_view_with_explicit_permission(api_client, sales_agent_role, agent, project):
    from django.contrib.auth.models import Permission

    view_perm = Permission.objects.get(content_type__app_label='projects', codename='view_project')
    sales_agent_role.permissions.add(view_perm)
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('project-list'))
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_filter_by_status(api_client, admin_user, project):
    Project.objects.create(
        name='Bagamoyo Palm City', location='Bagamoyo', total_area_sqm=Decimal('20000.00'),
        status=Project.Status.SELLING,
    )
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('project-list'), {'status': 'selling'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['name'] == 'Bagamoyo Palm City'


@pytest.mark.django_db
def test_search_by_name(api_client, admin_user, project):
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('project-list'), {'search': 'Buyuni'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
