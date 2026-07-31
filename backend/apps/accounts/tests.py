import pytest
from django.contrib.auth.models import Permission
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User


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
def customer_role(db):
    # Not granted any permissions anywhere in the seeding migrations — an
    # internal-admin-API role with genuinely nothing, unlike Sales Agent
    # which now has accounts.view_user for the CRM "assign to" picker.
    return Role.objects.get(name='Customer')


@pytest.fixture
def user(db, sales_agent_role):
    return User.objects.create_user(
        email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role,
    )


@pytest.fixture
def user_without_permissions(db, customer_role):
    return User.objects.create_user(
        email='no-perms@landflow.co.tz', password='s3cure-pass', role=customer_role,
    )


@pytest.fixture
def admin_user(db, administrator_role):
    return User.objects.create_user(
        email='admin@landflow.co.tz', password='s3cure-pass', role=administrator_role,
    )


@pytest.mark.django_db
def test_seed_creates_sixteen_roles():
    assert Role.objects.count() == 16
    assert Role.objects.get(name='Administrator').full_access is True
    assert Role.objects.get(name='Auditor').read_only_all is True


@pytest.mark.django_db
def test_login_returns_access_and_refresh_tokens(api_client, user):
    response = api_client.post(
        reverse('token_obtain_pair'), {'email': user.email, 'password': 's3cure-pass'},
    )
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data


@pytest.mark.django_db
def test_login_rejects_wrong_password(api_client, user):
    response = api_client.post(
        reverse('token_obtain_pair'), {'email': user.email, 'password': 'wrong'},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_refresh_returns_new_access_token(api_client, user):
    login = api_client.post(
        reverse('token_obtain_pair'), {'email': user.email, 'password': 's3cure-pass'},
    )
    response = api_client.post(reverse('token_refresh'), {'refresh': login.data['refresh']})
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data


@pytest.mark.django_db
def test_me_endpoint_returns_user_role_and_permissions(api_client, user):
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse('me'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == user.email
    assert response.data['role']['name'] == 'Sales Agent'
    # Subset check, not exact equality — Sales Agent gains more permissions as
    # each module lands its own permission-granting migration.
    assert {'plots.view_plot', 'projects.view_project'}.issubset(set(response.data['permissions']))


@pytest.mark.django_db
def test_me_endpoint_requires_authentication(api_client):
    response = api_client.get(reverse('me'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_administrator_has_full_access_permissions(admin_user):
    assert admin_user.get_permission_codes() == ['*']
    assert admin_user.has_perm('accounts.view_user') is True


@pytest.mark.django_db
def test_auditor_has_read_only_access(db):
    auditor_role = Role.objects.get(name='Auditor')
    auditor = User.objects.create_user(
        email='auditor@landflow.co.tz', password='s3cure-pass', role=auditor_role,
    )
    assert auditor.has_perm('accounts.view_user') is True
    assert auditor.has_perm('accounts.add_user') is False


@pytest.mark.django_db
def test_user_without_permission_gets_403_on_users_endpoint(api_client, user_without_permissions):
    api_client.force_authenticate(user=user_without_permissions)
    response = api_client.get(reverse('user-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_administrator_can_access_users_endpoint(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('user-list'))
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_explicit_role_permission_grants_access(api_client, sales_agent_role, user):
    view_user_perm = Permission.objects.get(content_type__app_label='accounts', codename='view_user')
    sales_agent_role.permissions.add(view_user_perm)
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse('user-list'))
    assert response.status_code == status.HTTP_200_OK
