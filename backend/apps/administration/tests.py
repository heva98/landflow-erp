from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User

from .models import ActivityLog, ApprovalWorkflow, Currency, Location, SystemSetting
from .services import log_activity


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def administrator_role(db):
    return Role.objects.get(name='Administrator')


@pytest.fixture
def sales_agent_role(db):
    # Not granted any administration permissions in the seeding migration.
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def admin_user(db, administrator_role):
    return User.objects.create_user(email='admin@landflow.co.tz', password='s3cure-pass', role=administrator_role)


@pytest.fixture
def sales_agent(db, sales_agent_role):
    return User.objects.create_user(email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role)


@pytest.fixture
def tzs(db):
    # Seeded by the 0002_seed_base_currency data migration.
    return Currency.objects.get(code='TZS')


# -- Currency ------------------------------------------------------------------


@pytest.mark.django_db
def test_setting_a_currency_as_base_unsets_the_previous_base(tzs):
    usd = Currency.objects.create(code='USD', name='US Dollar', symbol='$', is_base=True)
    tzs.refresh_from_db()
    assert usd.is_base is True
    assert tzs.is_base is False


@pytest.mark.django_db
def test_administrator_can_create_currency(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    response = api_client.post(
        reverse('currency-list'), {'code': 'KES', 'name': 'Kenyan Shilling', 'symbol': 'KSh'},
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert Currency.objects.filter(code='KES').exists()


@pytest.mark.django_db
def test_role_without_permission_is_forbidden(api_client, sales_agent):
    api_client.force_authenticate(user=sales_agent)
    response = api_client.get(reverse('currency-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


# -- Location --------------------------------------------------------------------


@pytest.mark.django_db
def test_district_must_belong_to_a_region(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    response = api_client.post(reverse('location-list'), {'name': 'Kinondoni', 'location_type': 'district'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'parent' in response.data


@pytest.mark.django_db
def test_district_created_under_a_region(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    region = Location.objects.create(name='Dar es Salaam', location_type='region')
    response = api_client.post(
        reverse('location-list'), {'name': 'Kinondoni', 'location_type': 'district', 'parent': str(region.id)},
    )
    assert response.status_code == status.HTTP_201_CREATED


# -- Settings ---------------------------------------------------------------------


@pytest.mark.django_db
def test_settings_singleton_load_returns_same_instance():
    first = SystemSetting.load()
    second = SystemSetting.load()
    assert first.pk == second.pk


@pytest.mark.django_db
def test_administrator_can_update_settings(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    response = api_client.patch(reverse('system-settings'), {'company_name': 'LandFlow Tanzania'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['company_name'] == 'LandFlow Tanzania'


# -- Approval workflow --------------------------------------------------------------


@pytest.mark.django_db
def test_approval_workflow_with_steps(api_client, admin_user, administrator_role):
    workflow = ApprovalWorkflow.objects.create(
        name='Large acquisition approval', workflow_type='land_acquisition', min_amount=Decimal('50000000'),
    )
    api_client.force_authenticate(user=admin_user)
    response = api_client.post(
        reverse('approvalstep-list'),
        {'workflow': str(workflow.id), 'order': 1, 'role': str(administrator_role.id), 'name': 'Director sign-off'},
    )
    assert response.status_code == status.HTTP_201_CREATED

    detail = api_client.get(reverse('approvalworkflow-detail', args=[workflow.id]))
    assert len(detail.data['steps']) == 1
    assert detail.data['steps'][0]['role_name'] == 'Administrator'


# -- Activity log --------------------------------------------------------------------


@pytest.mark.django_db
def test_activity_log_entries_are_immutable(admin_user):
    entry = log_activity(actor=admin_user, action=ActivityLog.Action.LOGIN, description='test login')
    with pytest.raises(ValueError):
        entry.delete()


@pytest.mark.django_db
def test_login_records_an_activity_log_entry(api_client, sales_agent):
    api_client.post(reverse('token_obtain_pair'), {'email': sales_agent.email, 'password': 's3cure-pass'})
    assert ActivityLog.objects.filter(actor=sales_agent, action=ActivityLog.Action.LOGIN).exists()


@pytest.mark.django_db
def test_failed_login_records_an_activity_log_entry(api_client, sales_agent):
    api_client.post(reverse('token_obtain_pair'), {'email': sales_agent.email, 'password': 'wrong'})
    assert ActivityLog.objects.filter(action=ActivityLog.Action.LOGIN_FAILED).exists()


@pytest.mark.django_db
def test_logout_blacklists_refresh_token_and_records_activity(api_client, sales_agent):
    login = api_client.post(reverse('token_obtain_pair'), {'email': sales_agent.email, 'password': 's3cure-pass'})
    api_client.force_authenticate(user=sales_agent)
    response = api_client.post(reverse('token_logout'), {'refresh': login.data['refresh']})
    assert response.status_code == status.HTTP_205_RESET_CONTENT
    assert ActivityLog.objects.filter(actor=sales_agent, action=ActivityLog.Action.LOGOUT).exists()
