from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.projects.models import Project

from .models import LandAcquisition, LandOwner, Negotiation, PurchaseCost


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def administrator_role(db):
    return Role.objects.get(name='Administrator')


@pytest.fixture
def legal_officer_role(db):
    return Role.objects.get(name='Legal Officer')


@pytest.fixture
def managing_director_role(db):
    return Role.objects.get(name='Managing Director')


@pytest.fixture
def sales_agent_role(db):
    # Not granted any acquisitions permissions in the seeding migration.
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def admin_user(db, administrator_role):
    return User.objects.create_user(email='admin@landflow.co.tz', password='s3cure-pass', role=administrator_role)


@pytest.fixture
def legal_officer(db, legal_officer_role):
    return User.objects.create_user(email='legal@landflow.co.tz', password='s3cure-pass', role=legal_officer_role)


@pytest.fixture
def managing_director(db, managing_director_role):
    return User.objects.create_user(
        email='director@landflow.co.tz', password='s3cure-pass', role=managing_director_role,
    )


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role)


@pytest.fixture
def acquisition(db):
    return LandAcquisition.objects.create(
        name='Buyuni Parcel 12', location='Buyuni, Dar es Salaam', area_sqm=Decimal('50000.00'),
        asking_price=Decimal('80000000.00'),
    )


@pytest.mark.django_db
def test_str_includes_reference_and_name(acquisition):
    assert str(acquisition) == f'{acquisition.reference_number} - Buyuni Parcel 12'


@pytest.mark.django_db
def test_reference_number_generated_on_save(acquisition):
    assert acquisition.reference_number.startswith('ACQ-')


@pytest.mark.django_db
def test_default_status_is_potential(acquisition):
    assert acquisition.status == LandAcquisition.Status.POTENTIAL


@pytest.mark.django_db
def test_total_purchase_cost_sums_purchase_price_and_costs(acquisition):
    acquisition.purchase_price = Decimal('80000000.00')
    acquisition.save(update_fields=['purchase_price'])
    PurchaseCost.objects.create(
        acquisition=acquisition, cost_type=PurchaseCost.CostType.LEGAL_FEES, amount=Decimal('500000.00'),
    )
    PurchaseCost.objects.create(
        acquisition=acquisition, cost_type=PurchaseCost.CostType.SURVEY_FEES, amount=Decimal('300000.00'),
    )
    assert acquisition.total_purchase_cost == Decimal('80800000.00')


@pytest.mark.django_db
def test_total_purchase_cost_with_no_costs(acquisition):
    assert acquisition.total_purchase_cost == Decimal('0.00')


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('landacquisition-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, agent, acquisition):
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('landacquisition-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_legal_officer_can_list_and_create(api_client, legal_officer):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.get(reverse('landacquisition-list'))
    assert response.status_code == status.HTTP_200_OK

    response = api_client.post(reverse('landacquisition-list'), {
        'name': 'Kigamboni Parcel 3', 'location': 'Kigamboni, Dar es Salaam', 'area_sqm': '20000.00',
    })
    assert response.status_code == status.HTTP_201_CREATED
    created = LandAcquisition.objects.get(name='Kigamboni Parcel 3')
    assert created.created_by_id == legal_officer.id


@pytest.mark.django_db
def test_administrator_can_list_acquisitions(api_client, admin_user, acquisition):
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(reverse('landacquisition-list'))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_status_field_is_read_only_on_update(api_client, legal_officer, acquisition):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.patch(reverse('landacquisition-detail', args=[acquisition.id]), {'status': 'approved'})
    assert response.status_code == status.HTTP_200_OK
    acquisition.refresh_from_db()
    assert acquisition.status == LandAcquisition.Status.POTENTIAL


@pytest.mark.django_db
def test_approve_requires_workflow_permission(api_client, legal_officer, acquisition):
    # Legal Officer has add/change on the model but not the approve permission.
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('landacquisition-approve', args=[acquisition.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_managing_director_can_approve(api_client, managing_director, acquisition):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('landacquisition-approve', args=[acquisition.id]))
    assert response.status_code == status.HTTP_200_OK
    acquisition.refresh_from_db()
    assert acquisition.status == LandAcquisition.Status.APPROVED
    assert acquisition.approved_by_id == managing_director.id
    assert acquisition.approved_at is not None


@pytest.mark.django_db
def test_cannot_approve_an_already_approved_acquisition(api_client, managing_director, acquisition):
    acquisition.status = LandAcquisition.Status.APPROVED
    acquisition.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('landacquisition-approve', args=[acquisition.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_mark_purchased_requires_approved_status(api_client, managing_director, acquisition):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(
        reverse('landacquisition-mark-purchased', args=[acquisition.id]), {'purchase_price': '80000000.00'},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_mark_purchased_from_approved(api_client, managing_director, acquisition):
    acquisition.status = LandAcquisition.Status.APPROVED
    acquisition.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(
        reverse('landacquisition-mark-purchased', args=[acquisition.id]), {'purchase_price': '80000000.00'},
    )
    assert response.status_code == status.HTTP_200_OK
    acquisition.refresh_from_db()
    assert acquisition.status == LandAcquisition.Status.PURCHASED
    assert acquisition.purchase_price == Decimal('80000000.00')
    assert acquisition.purchased_at is not None


@pytest.mark.django_db
def test_cancel_sets_reason_and_timestamp(api_client, managing_director, acquisition):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(
        reverse('landacquisition-cancel', args=[acquisition.id]), {'cancellation_reason': 'Owner withdrew.'},
    )
    assert response.status_code == status.HTTP_200_OK
    acquisition.refresh_from_db()
    assert acquisition.status == LandAcquisition.Status.CANCELLED
    assert acquisition.cancellation_reason == 'Owner withdrew.'
    assert acquisition.cancelled_at is not None


@pytest.mark.django_db
def test_cannot_cancel_a_purchased_acquisition(api_client, managing_director, acquisition):
    acquisition.status = LandAcquisition.Status.PURCHASED
    acquisition.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('landacquisition-cancel', args=[acquisition.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_spawn_project_requires_approved_or_purchased(api_client, managing_director, acquisition):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('landacquisition-spawn-project', args=[acquisition.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_spawn_project_creates_project_from_approved_acquisition(api_client, admin_user, acquisition):
    # Administrator has full_access, satisfying both approve_landacquisition
    # and projects.add_project.
    acquisition.status = LandAcquisition.Status.APPROVED
    acquisition.purchase_price = Decimal('80000000.00')
    acquisition.save(update_fields=['status', 'purchase_price'])
    api_client.force_authenticate(user=admin_user)

    response = api_client.post(reverse('landacquisition-spawn-project', args=[acquisition.id]))

    assert response.status_code == status.HTTP_201_CREATED
    acquisition.refresh_from_db()
    assert acquisition.project_id is not None
    project = Project.objects.get(pk=acquisition.project_id)
    assert project.name == 'Buyuni Parcel 12'
    assert project.total_area_sqm == Decimal('50000.00')
    assert project.acquisition_cost == Decimal('80000000.00')


@pytest.mark.django_db
def test_spawn_project_twice_fails(api_client, admin_user, acquisition):
    acquisition.status = LandAcquisition.Status.APPROVED
    acquisition.save(update_fields=['status'])
    api_client.force_authenticate(user=admin_user)
    api_client.post(reverse('landacquisition-spawn-project', args=[acquisition.id]))

    response = api_client.post(reverse('landacquisition-spawn-project', args=[acquisition.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_spawn_project_requires_project_add_permission(api_client, managing_director, acquisition):
    # Managing Director has approve_landacquisition but was never granted
    # projects.add_project, so spawning must be refused even though the
    # workflow permission is satisfied.
    acquisition.status = LandAcquisition.Status.APPROVED
    acquisition.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('landacquisition-spawn-project', args=[acquisition.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN
    acquisition.refresh_from_db()
    assert acquisition.project_id is None


@pytest.mark.django_db
def test_land_owner_crud_scoped_to_acquisition(api_client, legal_officer, acquisition):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('landowner-list'), {
        'acquisition': str(acquisition.id), 'full_name': 'Amina Juma', 'ownership_percentage': '100.00',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert LandOwner.objects.filter(acquisition=acquisition, full_name='Amina Juma').exists()

    response = api_client.get(reverse('landowner-list'), {'acquisition': str(acquisition.id)})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_negotiation_create_sets_negotiated_by(api_client, legal_officer, acquisition):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('negotiation-list'), {
        'acquisition': str(acquisition.id), 'offered_price': '75000000.00', 'counter_offer_price': '78000000.00',
    })
    assert response.status_code == status.HTTP_201_CREATED
    negotiation = Negotiation.objects.get(acquisition=acquisition)
    assert negotiation.negotiated_by_id == legal_officer.id


@pytest.mark.django_db
def test_purchase_cost_requires_permission(api_client, agent, acquisition):
    api_client.force_authenticate(user=agent)
    response = api_client.post(reverse('purchasecost-list'), {
        'acquisition': str(acquisition.id), 'cost_type': 'legal_fees', 'amount': '500000.00',
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_attachment_upload(api_client, legal_officer, acquisition):
    from django.core.files.uploadedfile import SimpleUploadedFile

    api_client.force_authenticate(user=legal_officer)
    upload = SimpleUploadedFile('title-deed.pdf', b'%PDF-1.4 stub', content_type='application/pdf')
    response = api_client.post(reverse('acquisitionattachment-list'), {
        'acquisition': str(acquisition.id), 'document_type': 'title_deed', 'file': upload,
    }, format='multipart')
    assert response.status_code == status.HTTP_201_CREATED
