from decimal import Decimal

import pytest
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.crm.models import Customer
from apps.notifications.models import Notification
from apps.plots.models import Plot
from apps.projects.models import Project
from apps.sales.models import Sale

from .models import Contract, DocumentTemplate, OwnershipTransfer, PowerOfAttorney, SaleAgreement, TitleDeed, Witness


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def legal_officer_role(db):
    return Role.objects.get(name='Legal Officer')


@pytest.fixture
def managing_director_role(db):
    return Role.objects.get(name='Managing Director')


@pytest.fixture
def sales_agent_role(db):
    # Not granted any legal permissions in the seeding migration.
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def legal_officer(db, legal_officer_role):
    return User.objects.create_user(email='legal@landflow.co.tz', password='s3cure-pass', role=legal_officer_role)


@pytest.fixture
def managing_director(db, managing_director_role):
    return User.objects.create_user(
        email='director@landflow.co.tz', password='s3cure-pass', role=managing_director_role,
    )


@pytest.fixture
def second_legal_officer(db, legal_officer_role):
    return User.objects.create_user(
        email='legal2@landflow.co.tz', password='s3cure-pass', role=legal_officer_role,
    )


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role)


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
def sale(db, plot, customer):
    sale = Sale.objects.create(
        plot=plot, customer=customer, sale_type=Sale.SaleType.CASH,
        sale_price=Decimal('20000000.00'), down_payment=Decimal('20000000.00'),
    )
    plot.owner = customer
    plot.save(update_fields=['owner'])
    return sale


@pytest.fixture
def sale_agreement(db, sale):
    return SaleAgreement.objects.create(sale=sale)


@pytest.fixture
def title_deed(db, sale):
    return TitleDeed.objects.create(sale=sale)


@pytest.fixture
def poa(db, sale):
    return PowerOfAttorney.objects.create(sale=sale, grantor_name='Juma Hassan', grantee_name='Amina Juma')


@pytest.fixture
def ownership_transfer(db, sale):
    return OwnershipTransfer.objects.create(sale=sale)


# ---------------------------------------------------------------------------
# Sale agreement
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_agreement_number_generated_and_status_defaults_to_draft(sale_agreement):
    assert sale_agreement.agreement_number.startswith('AGR-')
    assert sale_agreement.status == SaleAgreement.Status.DRAFT


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('saleagreement-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, agent, sale_agreement):
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('saleagreement-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_legal_officer_can_create_and_status_is_read_only(api_client, legal_officer, sale):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('saleagreement-list'), {'sale': str(sale.id)})
    assert response.status_code == status.HTTP_201_CREATED
    created = SaleAgreement.objects.get(id=response.data['id'])
    assert created.prepared_by_id == legal_officer.id

    response = api_client.patch(reverse('saleagreement-detail', args=[created.id]), {'status': 'approved'})
    assert response.status_code == status.HTTP_200_OK
    created.refresh_from_db()
    assert created.status == SaleAgreement.Status.DRAFT


@pytest.mark.django_db
def test_sale_agreement_happy_path_to_approved(api_client, legal_officer, managing_director, sale_agreement):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('saleagreement-send-for-signature', args=[sale_agreement.id]))
    assert response.status_code == status.HTTP_200_OK
    sale_agreement.refresh_from_db()
    assert sale_agreement.status == SaleAgreement.Status.SENT_FOR_SIGNATURE

    response = api_client.post(reverse('saleagreement-mark-signed', args=[sale_agreement.id]))
    assert response.status_code == status.HTTP_200_OK
    sale_agreement.refresh_from_db()
    assert sale_agreement.status == SaleAgreement.Status.SIGNED
    assert sale_agreement.signed_date is not None

    response = api_client.post(reverse('saleagreement-approve', args=[sale_agreement.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN

    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('saleagreement-approve', args=[sale_agreement.id]))
    assert response.status_code == status.HTTP_200_OK
    sale_agreement.refresh_from_db()
    assert sale_agreement.status == SaleAgreement.Status.APPROVED
    assert sale_agreement.approved_by_id == managing_director.id


@pytest.mark.django_db
def test_approve_requires_signed_status(api_client, managing_director, sale_agreement):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('saleagreement-approve', args=[sale_agreement.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_void_requires_workflow_permission(api_client, legal_officer, sale_agreement):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('saleagreement-void', args=[sale_agreement.id]), {'void_reason': 'Deal fell through.'})
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_managing_director_can_void(api_client, managing_director, sale_agreement):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(
        reverse('saleagreement-void', args=[sale_agreement.id]), {'void_reason': 'Deal fell through.'},
    )
    assert response.status_code == status.HTTP_200_OK
    sale_agreement.refresh_from_db()
    assert sale_agreement.status == SaleAgreement.Status.VOID
    assert sale_agreement.void_reason == 'Deal fell through.'
    assert sale_agreement.voided_at is not None


# ---------------------------------------------------------------------------
# Title deed
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_title_deed_default_status_is_pending(title_deed):
    assert title_deed.status == TitleDeed.Status.PENDING


@pytest.mark.django_db
def test_title_deed_happy_path_to_approved(api_client, legal_officer, managing_director, title_deed):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(
        reverse('titledeed-apply', args=[title_deed.id]), {'registry_office': 'Kinondoni Land Registry'},
    )
    assert response.status_code == status.HTTP_200_OK
    title_deed.refresh_from_db()
    assert title_deed.status == TitleDeed.Status.APPLIED
    assert title_deed.applied_date is not None

    response = api_client.post(reverse('titledeed-mark-issued', args=[title_deed.id]), {})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'deed_number' in response.data

    response = api_client.post(reverse('titledeed-mark-issued', args=[title_deed.id]), {'deed_number': 'TD-99871'})
    assert response.status_code == status.HTTP_200_OK
    title_deed.refresh_from_db()
    assert title_deed.status == TitleDeed.Status.ISSUED
    assert title_deed.deed_number == 'TD-99871'

    response = api_client.post(reverse('titledeed-approve', args=[title_deed.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN

    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('titledeed-approve', args=[title_deed.id]))
    assert response.status_code == status.HTTP_200_OK
    title_deed.refresh_from_db()
    assert title_deed.status == TitleDeed.Status.APPROVED
    assert title_deed.approved_by_id == managing_director.id


@pytest.mark.django_db
def test_title_deed_approve_requires_issued_status(api_client, managing_director, title_deed):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('titledeed-approve', args=[title_deed.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# Power of attorney
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_poa_number_generated_and_defaults_to_pending(poa):
    assert poa.poa_number.startswith('POA-')
    assert poa.status == PowerOfAttorney.Status.PENDING


@pytest.mark.django_db
def test_poa_approve_requires_workflow_permission(api_client, legal_officer, poa):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('powerofattorney-approve', args=[poa.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_managing_director_can_approve_poa(api_client, managing_director, poa):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('powerofattorney-approve', args=[poa.id]))
    assert response.status_code == status.HTTP_200_OK
    poa.refresh_from_db()
    assert poa.status == PowerOfAttorney.Status.ACTIVE
    assert poa.approved_by_id == managing_director.id
    assert poa.granted_date is not None


@pytest.mark.django_db
def test_poa_revoke_requires_active_status(api_client, managing_director, poa):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('powerofattorney-revoke', args=[poa.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_managing_director_can_revoke_active_poa(api_client, managing_director, poa):
    poa.status = PowerOfAttorney.Status.ACTIVE
    poa.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(
        reverse('powerofattorney-revoke', args=[poa.id]), {'revocation_reason': 'Grantor revoked in person.'},
    )
    assert response.status_code == status.HTTP_200_OK
    poa.refresh_from_db()
    assert poa.status == PowerOfAttorney.Status.REVOKED
    assert poa.revocation_reason == 'Grantor revoked in person.'


@pytest.mark.django_db
def test_expire_does_not_require_workflow_permission(api_client, legal_officer, poa):
    poa.status = PowerOfAttorney.Status.ACTIVE
    poa.save(update_fields=['status'])
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('powerofattorney-expire', args=[poa.id]))
    assert response.status_code == status.HTTP_200_OK
    poa.refresh_from_db()
    assert poa.status == PowerOfAttorney.Status.EXPIRED


# ---------------------------------------------------------------------------
# Contract
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_contract_number_generated_and_defaults_to_draft(db, legal_officer):
    contract = Contract.objects.create(
        title='Geomap Surveys Services Agreement', contract_type=Contract.ContractType.SERVICE,
        counterparty_name='Geomap Surveys Ltd', created_by=legal_officer,
    )
    assert contract.contract_number.startswith('CTR-')
    assert contract.status == Contract.Status.DRAFT


@pytest.mark.django_db
def test_contract_activate_and_terminate(api_client, legal_officer):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('legalcontract-list'), {
        'title': 'Vendor Agreement', 'contract_type': 'vendor', 'counterparty_name': 'Acme Supplies',
    })
    assert response.status_code == status.HTTP_201_CREATED
    contract_id = response.data['id']

    response = api_client.post(reverse('legalcontract-activate', args=[contract_id]))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['status'] == 'active'

    response = api_client.post(reverse('legalcontract-terminate', args=[contract_id]))
    assert response.status_code == status.HTTP_200_OK
    assert response.data['status'] == 'terminated'


# ---------------------------------------------------------------------------
# Witness (generic attachment)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_witness_scoped_to_content_type_and_object_id(api_client, legal_officer, sale_agreement, poa):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('witness-list'), {
        'content_type': 'legal.saleagreement', 'object_id': str(sale_agreement.id), 'full_name': 'Amina Juma',
    })
    assert response.status_code == status.HTTP_201_CREATED
    api_client.post(reverse('witness-list'), {
        'content_type': 'legal.powerofattorney', 'object_id': str(poa.id), 'full_name': 'Hassan Ally',
    })

    response = api_client.get(reverse('witness-list'), {
        'content_type': 'legal.saleagreement', 'object_id': str(sale_agreement.id),
    })
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['full_name'] == 'Amina Juma'


@pytest.mark.django_db
def test_witness_nested_on_sale_agreement_detail(api_client, legal_officer, sale_agreement):
    Witness.objects.create(
        content_type=ContentType.objects.get_for_model(SaleAgreement),
        object_id=str(sale_agreement.id), full_name='Amina Juma',
    )
    api_client.force_authenticate(user=legal_officer)
    response = api_client.get(reverse('saleagreement-detail', args=[sale_agreement.id]))
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['witnesses']) == 1
    assert response.data['witnesses'][0]['full_name'] == 'Amina Juma'


# ---------------------------------------------------------------------------
# Document template
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_document_template_crud(api_client, legal_officer):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('legaldocumenttemplate-list'), {
        'name': 'Standard Sale Agreement', 'template_type': 'sale_agreement',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert DocumentTemplate.objects.filter(name='Standard Sale Agreement').exists()


# ---------------------------------------------------------------------------
# Ownership transfer — the flagship workflow
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_transfer_number_generated_and_defaults_to_pending(ownership_transfer):
    assert ownership_transfer.transfer_number.startswith('OT-')
    assert ownership_transfer.status == OwnershipTransfer.Status.PENDING


@pytest.mark.django_db
def test_transfer_approve_requires_workflow_permission(api_client, legal_officer, ownership_transfer):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('ownershiptransfer-approve', args=[ownership_transfer.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_complete_requires_approved_status(api_client, managing_director, ownership_transfer):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('ownershiptransfer-complete', args=[ownership_transfer.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_reject_from_pending(api_client, managing_director, ownership_transfer):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(
        reverse('ownershiptransfer-reject', args=[ownership_transfer.id]), {'rejection_reason': 'Docs incomplete.'},
    )
    assert response.status_code == status.HTTP_200_OK
    ownership_transfer.refresh_from_db()
    assert ownership_transfer.status == OwnershipTransfer.Status.REJECTED
    assert ownership_transfer.rejection_reason == 'Docs incomplete.'


@pytest.mark.django_db
def test_complete_marks_plot_transferred_and_notifies_legal_staff(
    api_client, managing_director, legal_officer, second_legal_officer, ownership_transfer, plot,
):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('ownershiptransfer-approve', args=[ownership_transfer.id]))
    assert response.status_code == status.HTTP_200_OK

    response = api_client.post(reverse('ownershiptransfer-complete', args=[ownership_transfer.id]))
    assert response.status_code == status.HTTP_200_OK

    ownership_transfer.refresh_from_db()
    plot.refresh_from_db()
    assert ownership_transfer.status == OwnershipTransfer.Status.COMPLETED
    assert ownership_transfer.completed_at is not None
    assert plot.status == Plot.Status.TRANSFERRED

    notification = Notification.objects.get(notification_type=Notification.Type.OWNERSHIP_TRANSFER_COMPLETED)
    assert notification.status == Notification.Status.SENT
    assert legal_officer.email in notification.recipient_email
    assert second_legal_officer.email in notification.recipient_email


@pytest.mark.django_db
def test_complete_twice_fails(api_client, managing_director, ownership_transfer):
    api_client.force_authenticate(user=managing_director)
    api_client.post(reverse('ownershiptransfer-approve', args=[ownership_transfer.id]))
    api_client.post(reverse('ownershiptransfer-complete', args=[ownership_transfer.id]))

    response = api_client.post(reverse('ownershiptransfer-complete', args=[ownership_transfer.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST
