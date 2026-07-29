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
def receptionist_role(db):
    # A role with no project permissions at all, unlike Sales Agent which is
    # seeded with view_project.
    return Role.objects.get(name='Receptionist')


@pytest.fixture
def receptionist(db, receptionist_role):
    return User.objects.create_user(
        email='receptionist@landflow.co.tz', password='s3cure-pass', role=receptionist_role,
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
def test_sales_agent_can_list_projects(api_client, agent, project):
    # Sales Agent is seeded with view_project so agents can see the project list.
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('project-list'))
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, receptionist):
    api_client.force_authenticate(user=receptionist)
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
def test_role_can_view_with_explicit_permission(api_client, receptionist_role, receptionist, project):
    from django.contrib.auth.models import Permission

    view_perm = Permission.objects.get(content_type__app_label='projects', codename='view_project')
    receptionist_role.permissions.add(view_perm)
    api_client.force_authenticate(user=receptionist)
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


@pytest.mark.django_db
def test_owner_can_edit_their_project_without_change_permission(api_client, agent, project):
    project.owner = agent
    project.save(update_fields=['owner'])
    api_client.force_authenticate(user=agent)
    response = api_client.patch(reverse('project-detail', args=[project.id]), {'status': 'selling'})
    assert response.status_code == status.HTTP_200_OK
    project.refresh_from_db()
    assert project.status == Project.Status.SELLING


@pytest.mark.django_db
def test_non_owner_without_permission_cannot_edit(api_client, agent, project):
    api_client.force_authenticate(user=agent)
    response = api_client.patch(reverse('project-detail', args=[project.id]), {'status': 'selling'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_owner_can_retrieve_their_project_without_view_permission(api_client, receptionist, project):
    project.owner = receptionist
    project.save(update_fields=['owner'])
    api_client.force_authenticate(user=receptionist)
    response = api_client.get(reverse('project-detail', args=[project.id]))
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_non_owner_without_permission_cannot_retrieve(api_client, receptionist, project):
    api_client.force_authenticate(user=receptionist)
    response = api_client.get(reverse('project-detail', args=[project.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_owner_without_permission_still_cannot_list_all_projects(api_client, receptionist, project):
    project.owner = receptionist
    project.save(update_fields=['owner'])
    api_client.force_authenticate(user=receptionist)
    response = api_client.get(reverse('project-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_administrator_can_edit_a_project_they_do_not_own(api_client, admin_user, project):
    api_client.force_authenticate(user=admin_user)
    response = api_client.patch(reverse('project-detail', args=[project.id]), {'status': 'selling'})
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_administrator_can_assign_a_project_owner(api_client, admin_user, agent, project):
    api_client.force_authenticate(user=admin_user)
    response = api_client.patch(reverse('project-detail', args=[project.id]), {'owner_id': str(agent.id)})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['owner']['email'] == agent.email


@pytest.mark.django_db
def test_sales_agent_list_hides_financial_fields(api_client, agent, project):
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('project-list'))
    assert response.status_code == status.HTTP_200_OK
    result = response.data['results'][0]
    assert 'expected_revenue' not in result
    assert 'roi_percent' not in result
    assert 'acquisition_cost' not in result
    assert 'development_cost' not in result
    assert 'total_cost' not in result
    assert 'total_area_sqm' in result


@pytest.mark.django_db
def test_sales_agent_detail_hides_financial_fields(api_client, agent, project):
    project.owner = agent
    project.save(update_fields=['owner'])
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('project-detail', args=[project.id]))
    assert response.status_code == status.HTTP_200_OK
    assert 'expected_revenue' not in response.data
    assert 'roi_percent' not in response.data
    assert 'acquisition_cost' not in response.data
    assert 'development_cost' not in response.data
    assert 'total_cost' not in response.data


@pytest.mark.django_db
def test_sales_agent_cannot_set_financial_fields_when_editing_own_project(api_client, agent, project):
    project.owner = agent
    project.save(update_fields=['owner'])
    api_client.force_authenticate(user=agent)
    response = api_client.patch(
        reverse('project-detail', args=[project.id]),
        {'acquisition_cost': '1.00', 'development_cost': '1.00', 'expected_revenue': '1.00'},
    )
    assert response.status_code == status.HTTP_200_OK
    project.refresh_from_db()
    assert project.acquisition_cost == Decimal('100000000.00')
    assert project.development_cost == Decimal('50000000.00')
    assert project.expected_revenue == Decimal('300000000.00')


@pytest.mark.django_db
def test_administrator_list_includes_financial_fields(api_client, admin_user, project):
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('project-list'))
    result = response.data['results'][0]
    assert result['expected_revenue'] == '300000000.00'
    assert result['roi_percent'] == '100.00'
    assert result['acquisition_cost'] == '100000000.00'
    assert result['development_cost'] == '50000000.00'
    assert result['total_cost'] == '150000000.00'


@pytest.mark.django_db
def test_role_with_explicit_financials_permission_sees_expected_revenue(
    api_client, sales_agent_role, agent, project,
):
    from django.contrib.auth.models import Permission

    financials_perm = Permission.objects.get(content_type__app_label='projects', codename='view_project_financials')
    sales_agent_role.permissions.add(financials_perm)
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('project-list'))
    result = response.data['results'][0]
    assert result['expected_revenue'] == '300000000.00'
