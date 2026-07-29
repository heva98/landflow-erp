from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.crm.models import CommunicationLog, Customer, Lead, Note, Organization
from apps.projects.models import Project


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def administrator_role(db):
    return Role.objects.get(name='Administrator')


@pytest.fixture
def crm_officer_role(db):
    return Role.objects.get(name='CRM Officer')


@pytest.fixture
def sales_agent_role(db):
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def managing_director_role(db):
    # Granted view-only access to CRM in the seeding migration.
    return Role.objects.get(name='Managing Director')


@pytest.fixture
def surveyor_role(db):
    # Not granted any CRM permissions in the seeding migration.
    return Role.objects.get(name='Surveyor')


@pytest.fixture
def admin_user(db, administrator_role):
    return User.objects.create_user(
        email='admin@landflow.co.tz', password='s3cure-pass', role=administrator_role,
    )


@pytest.fixture
def crm_officer(db, crm_officer_role):
    return User.objects.create_user(
        email='crm@landflow.co.tz', password='s3cure-pass', role=crm_officer_role,
    )


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(
        email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role,
    )


@pytest.fixture
def managing_director(db, managing_director_role):
    return User.objects.create_user(
        email='director@landflow.co.tz', password='s3cure-pass', role=managing_director_role,
    )


@pytest.fixture
def surveyor(db, surveyor_role):
    return User.objects.create_user(
        email='surveyor@landflow.co.tz', password='s3cure-pass', role=surveyor_role,
    )


@pytest.fixture
def organization(db):
    return Organization.objects.create(name='Acacia Holdings Ltd', tin='123-456-789')


@pytest.fixture
def customer(db):
    return Customer.objects.create(full_name='Amina Juma', phone='+255700111222', email='amina@example.com')


@pytest.fixture
def project(db):
    return Project.objects.create(
        name='Buyuni Phase II', location='Buyuni, Dar es Salaam', total_area_sqm=Decimal('50000.00'),
    )


@pytest.fixture
def lead(db, project):
    return Lead.objects.create(
        full_name='John Mushi', phone='+255700333444', source=Lead.Source.WEBSITE, interested_project=project,
    )


# --- Model behaviour ---

@pytest.mark.django_db
def test_lead_default_status_is_new(lead):
    assert lead.status == Lead.Status.NEW


@pytest.mark.django_db
def test_lead_str_includes_name_and_status(lead):
    assert str(lead) == 'John Mushi (New)'


@pytest.mark.django_db
def test_customer_default_type_is_individual(customer):
    assert customer.customer_type == Customer.CustomerType.INDIVIDUAL


@pytest.mark.django_db
def test_lead_referred_by_links_existing_customer(customer, project):
    lead = Lead.objects.create(
        full_name='Peter Kessy', source=Lead.Source.REFERRAL, referred_by=customer,
    )
    assert lead.referred_by == customer
    assert customer.referrals.count() == 1


@pytest.mark.django_db
def test_note_generic_target_resolves_to_lead(lead, crm_officer):
    from django.contrib.contenttypes.models import ContentType

    note = Note.objects.create(
        content_type=ContentType.objects.get_for_model(Lead), object_id=lead.id,
        author=crm_officer, body='Called, interested in a corner plot.',
    )
    assert note.target == lead


# --- API access control ---

@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('lead-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_crm_officer_can_list_leads(api_client, crm_officer, lead):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.get(reverse('lead-list'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, surveyor, lead):
    api_client.force_authenticate(user=surveyor)
    response = api_client.get(reverse('lead-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_managing_director_can_view_but_not_edit_leads(api_client, managing_director, lead):
    api_client.force_authenticate(user=managing_director)
    response = api_client.get(reverse('lead-list'))
    assert response.status_code == status.HTTP_200_OK

    response = api_client.patch(reverse('lead-detail', args=[lead.id]), {'status': 'contacted'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_sales_agent_can_create_and_progress_a_lead(api_client, agent, project):
    api_client.force_authenticate(user=agent)
    response = api_client.post(reverse('lead-list'), {
        'full_name': 'Grace Mtei', 'phone': '+255700555666', 'source': 'facebook',
        'interested_project': str(project.id),
    })
    assert response.status_code == status.HTTP_201_CREATED
    lead_id = response.data['id']
    assert response.data['status'] == 'new'

    response = api_client.patch(reverse('lead-detail', args=[lead_id]), {'status': 'site_visit'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['status'] == 'site_visit'


@pytest.mark.django_db
def test_filter_leads_by_status(api_client, crm_officer, lead):
    Lead.objects.create(full_name='Lost One', source=Lead.Source.BILLBOARD, status=Lead.Status.LOST)
    api_client.force_authenticate(user=crm_officer)
    response = api_client.get(reverse('lead-list'), {'status': 'new'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['full_name'] == 'John Mushi'


@pytest.mark.django_db
def test_search_customers_by_name(api_client, crm_officer, customer):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.get(reverse('customer-list'), {'search': 'Amina'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_convert_lead_by_setting_converted_customer(api_client, crm_officer, lead, customer):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.patch(reverse('lead-detail', args=[lead.id]), {
        'status': 'purchased', 'converted_customer': str(customer.id),
    })
    assert response.status_code == status.HTTP_200_OK
    lead.refresh_from_db()
    assert lead.status == Lead.Status.PURCHASED
    assert lead.converted_customer == customer


# --- Notes and communication log (generic target) ---

@pytest.mark.django_db
def test_create_note_on_a_lead_via_api(api_client, crm_officer, lead):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.post(reverse('note-list'), {'lead': str(lead.id), 'body': 'Follow up next week.'})
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['target_type'] == 'lead'
    assert response.data['target_id'] == str(lead.id)
    note = Note.objects.get(pk=response.data['id'])
    assert note.author.email == 'crm@landflow.co.tz'


@pytest.mark.django_db
def test_create_note_without_a_target_is_rejected(api_client, crm_officer):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.post(reverse('note-list'), {'body': 'Orphan note.'})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_create_note_with_two_targets_is_rejected(api_client, crm_officer, lead, customer):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.post(reverse('note-list'), {
        'lead': str(lead.id), 'customer': str(customer.id), 'body': 'Ambiguous.',
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_log_a_whatsapp_communication_on_a_customer(api_client, crm_officer, customer):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.post(reverse('communicationlog-list'), {
        'customer': str(customer.id), 'channel': 'whatsapp', 'direction': 'outbound',
        'body': 'Sent payment schedule.',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['target_type'] == 'customer'
    log = CommunicationLog.objects.get(pk=response.data['id'])
    assert log.logged_by.email == 'crm@landflow.co.tz'
    assert log.target == customer


@pytest.mark.django_db
def test_filter_communications_by_target(api_client, crm_officer, customer, lead):
    from django.contrib.contenttypes.models import ContentType

    CommunicationLog.objects.create(
        content_type=ContentType.objects.get_for_model(Customer), object_id=customer.id,
        channel=CommunicationLog.Channel.CALL, direction=CommunicationLog.Direction.INBOUND,
    )
    CommunicationLog.objects.create(
        content_type=ContentType.objects.get_for_model(Lead), object_id=lead.id,
        channel=CommunicationLog.Channel.SMS, direction=CommunicationLog.Direction.OUTBOUND,
    )
    api_client.force_authenticate(user=crm_officer)
    response = api_client.get(reverse('communicationlog-list'), {'target_type': 'customer'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['channel'] == 'call'
