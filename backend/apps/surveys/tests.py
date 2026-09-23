from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.projects.models import Project

from .models import Beacon, Subdivision, SubdivisionPlot, Survey, SurveyCompany, Surveyor


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def surveyor_role(db):
    return Role.objects.get(name='Surveyor')


@pytest.fixture
def managing_director_role(db):
    return Role.objects.get(name='Managing Director')


@pytest.fixture
def sales_agent_role(db):
    # Not granted any surveys permissions in the seeding migration.
    return Role.objects.get(name='Sales Agent')


@pytest.fixture
def surveyor_user(db, surveyor_role):
    return User.objects.create_user(email='fieldwork@landflow.co.tz', password='s3cure-pass', role=surveyor_role)


@pytest.fixture
def managing_director(db, managing_director_role):
    return User.objects.create_user(
        email='director@landflow.co.tz', password='s3cure-pass', role=managing_director_role,
    )


@pytest.fixture
def agent(db, sales_agent_role):
    return User.objects.create_user(email='agent@landflow.co.tz', password='s3cure-pass', role=sales_agent_role)


@pytest.fixture
def project(db):
    return Project.objects.create(name='Buyuni Phase II', location='Buyuni, Dar es Salaam', total_area_sqm=Decimal('50000.00'))


@pytest.fixture
def survey_company(db):
    return SurveyCompany.objects.create(name='Geomap Surveys Ltd', license_number='GS-001')


@pytest.fixture
def surveyor(db, survey_company):
    return Surveyor.objects.create(company=survey_company, full_name='Juma Kessy', license_number='SUR-001')


@pytest.fixture
def survey(db, project, survey_company, surveyor):
    return Survey.objects.create(
        project=project, company=survey_company, lead_surveyor=surveyor, area_surveyed_sqm=Decimal('50000.00'),
    )


@pytest.fixture
def subdivision(db, survey):
    return Subdivision.objects.create(survey=survey, gross_area_sqm=Decimal('50000.00'))


@pytest.mark.django_db
def test_str_includes_reference_and_project(survey):
    assert str(survey) == f'{survey.reference_number} - {survey.project.name}'


@pytest.mark.django_db
def test_reference_number_generated_on_save(survey):
    assert survey.reference_number.startswith('SUR-')


@pytest.mark.django_db
def test_default_status_is_scheduled(survey):
    assert survey.status == Survey.Status.SCHEDULED


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('survey-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, agent, survey):
    api_client.force_authenticate(user=agent)
    response = api_client.get(reverse('survey-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_surveyor_can_list_and_create_survey(api_client, surveyor_user, project, survey_company, surveyor):
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.get(reverse('survey-list'))
    assert response.status_code == status.HTTP_200_OK

    response = api_client.post(reverse('survey-list'), {
        'project': str(project.id), 'company': str(survey_company.id), 'lead_surveyor': str(surveyor.id),
    })
    assert response.status_code == status.HTTP_201_CREATED
    created = Survey.objects.get(id=response.data['id'])
    assert created.created_by_id == surveyor_user.id


@pytest.mark.django_db
def test_status_field_is_read_only_on_update(api_client, surveyor_user, survey):
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.patch(reverse('survey-detail', args=[survey.id]), {'status': 'approved'})
    assert response.status_code == status.HTTP_200_OK
    survey.refresh_from_db()
    assert survey.status == Survey.Status.SCHEDULED


@pytest.mark.django_db
def test_start_requires_scheduled_status(api_client, surveyor_user, survey):
    survey.status = Survey.Status.IN_PROGRESS
    survey.save(update_fields=['status'])
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('survey-start', args=[survey.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_start_transitions_to_in_progress(api_client, surveyor_user, survey):
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('survey-start', args=[survey.id]))
    assert response.status_code == status.HTTP_200_OK
    survey.refresh_from_db()
    assert survey.status == Survey.Status.IN_PROGRESS


@pytest.mark.django_db
def test_complete_requires_in_progress_status(api_client, surveyor_user, survey):
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('survey-complete', args=[survey.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_complete_transitions_and_sets_completed_date(api_client, surveyor_user, survey):
    survey.status = Survey.Status.IN_PROGRESS
    survey.save(update_fields=['status'])
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('survey-complete', args=[survey.id]), {'area_surveyed_sqm': '49000.00'})
    assert response.status_code == status.HTTP_200_OK
    survey.refresh_from_db()
    assert survey.status == Survey.Status.COMPLETED
    assert survey.completed_date is not None
    assert survey.area_surveyed_sqm == Decimal('49000.00')


@pytest.mark.django_db
def test_approve_requires_workflow_permission(api_client, surveyor_user, survey):
    # Surveyor has add/change on the model but not the approve permission.
    survey.status = Survey.Status.COMPLETED
    survey.save(update_fields=['status'])
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('survey-approve', args=[survey.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_approve_requires_completed_status(api_client, managing_director, survey):
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('survey-approve', args=[survey.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_managing_director_can_approve_completed_survey(api_client, managing_director, survey):
    survey.status = Survey.Status.COMPLETED
    survey.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('survey-approve', args=[survey.id]))
    assert response.status_code == status.HTTP_200_OK
    survey.refresh_from_db()
    assert survey.status == Survey.Status.APPROVED
    assert survey.approved_by_id == managing_director.id
    assert survey.approved_at is not None


@pytest.mark.django_db
def test_reject_sets_reason(api_client, managing_director, survey):
    survey.status = Survey.Status.COMPLETED
    survey.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('survey-reject', args=[survey.id]), {'rejection_reason': 'Beacons missing.'})
    assert response.status_code == status.HTTP_200_OK
    survey.refresh_from_db()
    assert survey.status == Survey.Status.REJECTED
    assert survey.rejection_reason == 'Beacons missing.'


@pytest.mark.django_db
def test_beacon_crud_scoped_to_survey(api_client, surveyor_user, survey):
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('beacon-list'), {
        'survey': str(survey.id), 'beacon_number': 'B-01', 'latitude': '-6.792400', 'longitude': '39.208300',
    })
    assert response.status_code == status.HTTP_201_CREATED
    assert Beacon.objects.filter(survey=survey, beacon_number='B-01').exists()

    response = api_client.get(reverse('beacon-list'), {'survey': str(survey.id)})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_survey_document_upload(api_client, surveyor_user, survey):
    from django.core.files.uploadedfile import SimpleUploadedFile

    api_client.force_authenticate(user=surveyor_user)
    upload = SimpleUploadedFile('subdivision-plan.dwg', b'CAD stub', content_type='application/octet-stream')
    response = api_client.post(reverse('surveydocument-list'), {
        'survey': str(survey.id), 'document_type': 'cad', 'file': upload,
    }, format='multipart')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['uploaded_by'] == surveyor_user.id


@pytest.mark.django_db
def test_subdivision_default_status_is_draft(subdivision):
    assert subdivision.status == Subdivision.Status.DRAFT


@pytest.mark.django_db
def test_subdivision_auto_computes_net_saleable_area(db, survey):
    subdivision = Subdivision.objects.create(
        survey=survey, gross_area_sqm=Decimal('50000.00'),
        road_reserve_area_sqm=Decimal('5000.00'), utility_reserve_area_sqm=Decimal('1000.00'),
        open_space_area_sqm=Decimal('2000.00'),
    )
    assert subdivision.net_saleable_area_sqm == Decimal('42000.00')


@pytest.mark.django_db
def test_submit_requires_draft_status(api_client, surveyor_user, subdivision):
    subdivision.status = Subdivision.Status.SUBMITTED
    subdivision.save(update_fields=['status'])
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('subdivision-submit', args=[subdivision.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_submit_transitions_to_submitted(api_client, surveyor_user, subdivision):
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('subdivision-submit', args=[subdivision.id]))
    assert response.status_code == status.HTTP_200_OK
    subdivision.refresh_from_db()
    assert subdivision.status == Subdivision.Status.SUBMITTED


@pytest.mark.django_db
def test_approve_subdivision_requires_workflow_permission(api_client, surveyor_user, subdivision):
    subdivision.status = Subdivision.Status.SUBMITTED
    subdivision.save(update_fields=['status'])
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('subdivision-approve', args=[subdivision.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_managing_director_can_approve_subdivision(api_client, managing_director, subdivision):
    subdivision.status = Subdivision.Status.SUBMITTED
    subdivision.save(update_fields=['status'])
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('subdivision-approve', args=[subdivision.id]))
    assert response.status_code == status.HTTP_200_OK
    subdivision.refresh_from_db()
    assert subdivision.status == Subdivision.Status.APPROVED
    assert subdivision.approved_by_id == managing_director.id


@pytest.mark.django_db
def test_convert_to_plot_requires_approved_subdivision(api_client, managing_director, subdivision):
    planned_plot = SubdivisionPlot.objects.create(
        subdivision=subdivision, plot_number='P-01', area_sqm=Decimal('500.00'),
    )
    api_client.force_authenticate(user=managing_director)
    response = api_client.post(reverse('subdivisionplot-convert-to-plot', args=[planned_plot.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_convert_to_plot_requires_plots_add_permission(api_client, surveyor_user, subdivision):
    # Surveyor has view-only access to plots, not add_plot.
    subdivision.status = Subdivision.Status.APPROVED
    subdivision.save(update_fields=['status'])
    planned_plot = SubdivisionPlot.objects.create(
        subdivision=subdivision, plot_number='P-01', area_sqm=Decimal('500.00'),
    )
    api_client.force_authenticate(user=surveyor_user)
    response = api_client.post(reverse('subdivisionplot-convert-to-plot', args=[planned_plot.id]))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_managing_director_can_convert_to_plot(api_client, managing_director, subdivision, project):
    subdivision.status = Subdivision.Status.APPROVED
    subdivision.save(update_fields=['status'])
    planned_plot = SubdivisionPlot.objects.create(
        subdivision=subdivision, plot_number='P-01', block='A', area_sqm=Decimal('500.00'),
    )
    api_client.force_authenticate(user=managing_director)

    response = api_client.post(reverse('subdivisionplot-convert-to-plot', args=[planned_plot.id]))

    assert response.status_code == status.HTTP_201_CREATED
    planned_plot.refresh_from_db()
    assert planned_plot.plot_id is not None
    assert planned_plot.plot.project_id == project.id
    assert planned_plot.plot.plot_number == 'P-01'
    assert planned_plot.plot.area_sqm == Decimal('500.00')


@pytest.mark.django_db
def test_convert_to_plot_twice_fails(api_client, managing_director, subdivision):
    subdivision.status = Subdivision.Status.APPROVED
    subdivision.save(update_fields=['status'])
    planned_plot = SubdivisionPlot.objects.create(
        subdivision=subdivision, plot_number='P-01', area_sqm=Decimal('500.00'),
    )
    api_client.force_authenticate(user=managing_director)
    api_client.post(reverse('subdivisionplot-convert-to-plot', args=[planned_plot.id]))

    response = api_client.post(reverse('subdivisionplot-convert-to-plot', args=[planned_plot.id]))
    assert response.status_code == status.HTTP_400_BAD_REQUEST
