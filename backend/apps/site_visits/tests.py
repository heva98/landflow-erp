from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.crm.models import Lead
from apps.projects.models import Project

from .models import Bus, Driver, FollowUp, SiteVisit, SiteVisitBooking, VisitFeedback


@pytest.fixture(autouse=True)
def media_root(settings, tmp_path):
    # Every booking save writes a QR code image — keep test output out of the real media/ dir.
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def crm_officer_role(db):
    return Role.objects.get(name='CRM Officer')


@pytest.fixture
def sales_agent_role(db):
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def site_manager_role(db):
    return Role.objects.get(name='Site Manager')


@pytest.fixture
def cashier_role(db):
    # Not granted any site_visits permissions in the seeding migration.
    return Role.objects.get(name='Cashier')


@pytest.fixture
def crm_officer(db, crm_officer_role):
    return User.objects.create_user(email='crm@landflow.co.tz', password='s3cure-pass', role=crm_officer_role)


@pytest.fixture
def sales_agent(db, sales_agent_role):
    return User.objects.create_user(email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role)


@pytest.fixture
def site_manager(db, site_manager_role):
    return User.objects.create_user(
        email='sitemanager@landflow.co.tz', password='s3cure-pass', role=site_manager_role,
    )


@pytest.fixture
def cashier(db, cashier_role):
    return User.objects.create_user(email='cashier@landflow.co.tz', password='s3cure-pass', role=cashier_role)


@pytest.fixture
def project(db):
    return Project.objects.create(
        name='Buyuni Phase II', location='Buyuni, Dar es Salaam', total_area_sqm=Decimal('50000.00'),
    )


@pytest.fixture
def lead(db):
    return Lead.objects.create(full_name='Juma Hassan', phone='+255700000000', source=Lead.Source.WEBSITE)


@pytest.fixture
def driver(db):
    return Driver.objects.create(full_name='Ali Mwakasege', phone='+255711111111')


@pytest.fixture
def bus(db, driver):
    return Bus.objects.create(registration_number='T123 ABC', capacity=30, driver=driver)


@pytest.fixture
def site_visit(db, project, bus):
    return SiteVisit.objects.create(project=project, visit_date='2026-09-01', bus=bus)


@pytest.fixture
def booking(db, site_visit, lead):
    return SiteVisitBooking.objects.create(site_visit=site_visit, lead=lead)


@pytest.mark.django_db
def test_reference_number_generated_and_status_defaults_to_scheduled(site_visit):
    assert site_visit.reference_number.startswith('SV-')
    assert site_visit.status == SiteVisit.Status.SCHEDULED


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('sitevisit-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, cashier, site_visit):
    api_client.force_authenticate(user=cashier)
    response = api_client.get(reverse('sitevisit-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_crm_officer_can_create_site_visit(api_client, crm_officer, project):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.post(reverse('sitevisit-list'), {'project': str(project.id), 'visit_date': '2026-09-15'})
    assert response.status_code == status.HTTP_201_CREATED
    created = SiteVisit.objects.get(id=response.data['id'])
    assert created.organized_by_id == crm_officer.id


@pytest.mark.django_db
def test_status_field_is_read_only_on_update(api_client, crm_officer, site_visit):
    api_client.force_authenticate(user=crm_officer)
    response = api_client.patch(reverse('sitevisit-detail', args=[site_visit.id]), {'status': 'completed'})
    assert response.status_code == status.HTTP_200_OK
    site_visit.refresh_from_db()
    assert site_visit.status == SiteVisit.Status.SCHEDULED


@pytest.mark.django_db
def test_site_visit_start_complete_workflow(api_client, site_manager, site_visit):
    api_client.force_authenticate(user=site_manager)

    response = api_client.post(reverse('sitevisit-complete', args=[site_visit.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    response = api_client.post(reverse('sitevisit-start', args=[site_visit.id]))
    assert response.status_code == status.HTTP_200_OK
    site_visit.refresh_from_db()
    assert site_visit.status == SiteVisit.Status.IN_PROGRESS

    response = api_client.post(reverse('sitevisit-complete', args=[site_visit.id]))
    assert response.status_code == status.HTTP_200_OK
    site_visit.refresh_from_db()
    assert site_visit.status == SiteVisit.Status.COMPLETED


@pytest.mark.django_db
def test_cancel_rejects_completed_visit(api_client, site_manager, site_visit):
    site_visit.status = SiteVisit.Status.COMPLETED
    site_visit.save(update_fields=['status'])
    api_client.force_authenticate(user=site_manager)
    response = api_client.post(reverse('sitevisit-cancel', args=[site_visit.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# Bookings
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_booking_generates_qr_token_and_image(booking):
    assert booking.qr_token
    assert booking.qr_code.name
    assert booking.status == SiteVisitBooking.Status.BOOKED


@pytest.mark.django_db
def test_creating_booking_advances_lead_to_site_visit_stage(api_client, sales_agent, site_visit, lead):
    assert lead.status == Lead.Status.NEW
    api_client.force_authenticate(user=sales_agent)

    response = api_client.post(reverse('sitevisitbooking-list'), {
        'site_visit': str(site_visit.id), 'lead': str(lead.id),
    })

    assert response.status_code == status.HTTP_201_CREATED
    lead.refresh_from_db()
    assert lead.status == Lead.Status.SITE_VISIT


@pytest.mark.django_db
def test_duplicate_booking_for_same_lead_and_visit_rejected(api_client, sales_agent, site_visit, lead):
    SiteVisitBooking.objects.create(site_visit=site_visit, lead=lead)
    api_client.force_authenticate(user=sales_agent)
    response = api_client.post(reverse('sitevisitbooking-list'), {
        'site_visit': str(site_visit.id), 'lead': str(lead.id),
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_booking_confirm_cancel_no_show(api_client, sales_agent, booking):
    api_client.force_authenticate(user=sales_agent)

    response = api_client.post(reverse('sitevisitbooking-confirm', args=[booking.id]))
    assert response.status_code == status.HTTP_200_OK
    booking.refresh_from_db()
    assert booking.status == SiteVisitBooking.Status.CONFIRMED

    response = api_client.post(reverse('sitevisitbooking-mark-no-show', args=[booking.id]))
    assert response.status_code == status.HTTP_200_OK
    booking.refresh_from_db()
    assert booking.status == SiteVisitBooking.Status.NO_SHOW


@pytest.mark.django_db
def test_cancel_booking(api_client, sales_agent, booking):
    api_client.force_authenticate(user=sales_agent)
    response = api_client.post(reverse('sitevisitbooking-cancel', args=[booking.id]))
    assert response.status_code == status.HTTP_200_OK
    booking.refresh_from_db()
    assert booking.status == SiteVisitBooking.Status.CANCELLED

    response = api_client.post(reverse('sitevisitbooking-cancel', args=[booking.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# QR check-in
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_check_in_requires_token(api_client, site_manager):
    api_client.force_authenticate(user=site_manager)
    response = api_client.post(reverse('sitevisitbooking-check-in'), {})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_check_in_unknown_token_returns_404(api_client, site_manager):
    api_client.force_authenticate(user=site_manager)
    response = api_client.post(reverse('sitevisitbooking-check-in'), {'token': 'does-not-exist'})
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_check_in_by_token_succeeds(api_client, site_manager, booking):
    api_client.force_authenticate(user=site_manager)
    response = api_client.post(reverse('sitevisitbooking-check-in'), {'token': booking.qr_token})
    assert response.status_code == status.HTTP_200_OK
    booking.refresh_from_db()
    assert booking.checked_in_at is not None
    assert booking.checked_in_by_id == site_manager.id
    assert booking.is_checked_in is True


@pytest.mark.django_db
def test_check_in_twice_fails(api_client, site_manager, booking):
    api_client.force_authenticate(user=site_manager)
    api_client.post(reverse('sitevisitbooking-check-in'), {'token': booking.qr_token})
    response = api_client.post(reverse('sitevisitbooking-check-in'), {'token': booking.qr_token})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_check_in_cancelled_booking_fails(api_client, site_manager, booking):
    booking.status = SiteVisitBooking.Status.CANCELLED
    booking.save(update_fields=['status'])
    api_client.force_authenticate(user=site_manager)
    response = api_client.post(reverse('sitevisitbooking-check-in'), {'token': booking.qr_token})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# Feedback, photos, follow-ups
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_submit_feedback_for_booking(api_client, sales_agent, booking):
    api_client.force_authenticate(user=sales_agent)
    response = api_client.post(reverse('visitfeedback-list'), {
        'booking': str(booking.id), 'rating': 5, 'comments': 'Loved it', 'interested_in_purchasing': True,
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert VisitFeedback.objects.filter(booking=booking, rating=5).exists()


@pytest.mark.django_db
def test_photo_upload(api_client, crm_officer, site_visit):
    from django.core.files.uploadedfile import SimpleUploadedFile

    api_client.force_authenticate(user=crm_officer)
    upload = SimpleUploadedFile('photo.jpg', _tiny_jpeg_bytes(), content_type='image/jpeg')
    response = api_client.post(reverse('visitphoto-list'), {
        'site_visit': str(site_visit.id), 'caption': 'Group photo', 'file': upload,
    }, format='multipart')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['uploaded_by'] == crm_officer.id


@pytest.mark.django_db
def test_create_and_complete_follow_up(api_client, sales_agent, booking):
    api_client.force_authenticate(user=sales_agent)
    response = api_client.post(reverse('followup-list'), {
        'booking': str(booking.id), 'due_date': '2026-09-05', 'notes': 'Call about financing options',
    })
    assert response.status_code == status.HTTP_201_CREATED
    follow_up_id = response.data['id']
    assert FollowUp.objects.get(id=follow_up_id).status == FollowUp.Status.PENDING

    response = api_client.post(reverse('followup-mark-done', args=[follow_up_id]))
    assert response.status_code == status.HTTP_200_OK
    follow_up = FollowUp.objects.get(id=follow_up_id)
    assert follow_up.status == FollowUp.Status.DONE
    assert follow_up.completed_at is not None


def _tiny_jpeg_bytes():
    # A real 1x1 JPEG generated with Pillow, so ImageField's validation
    # (which actually opens and verifies the file) accepts it reliably.
    from io import BytesIO

    from PIL import Image

    buffer = BytesIO()
    Image.new('RGB', (1, 1), color='white').save(buffer, format='JPEG')
    return buffer.getvalue()
