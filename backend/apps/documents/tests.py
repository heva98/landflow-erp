from decimal import Decimal

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Role, User
from apps.acquisitions.models import LandAcquisition

from .models import Document, DocumentVersion


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def document_officer_role(db):
    return Role.objects.get(name='Document Officer')


@pytest.fixture
def legal_officer_role(db):
    return Role.objects.get(name='Legal Officer')


@pytest.fixture
def customer_role(db):
    # Not granted any documents permissions — a customer shouldn't reach the internal API.
    return Role.objects.get(name='Customer')


@pytest.fixture
def document_officer(db, document_officer_role):
    return User.objects.create_user(
        email='docs@landflow.co.tz', password='s3cure-pass', role=document_officer_role,
    )


@pytest.fixture
def legal_officer(db, legal_officer_role):
    return User.objects.create_user(email='legal@landflow.co.tz', password='s3cure-pass', role=legal_officer_role)


@pytest.fixture
def customer(db, customer_role):
    return User.objects.create_user(email='customer@example.com', password='s3cure-pass', role=customer_role)


@pytest.fixture
def acquisition(db):
    return LandAcquisition.objects.create(
        name='Buyuni Parcel 12', location='Buyuni, Dar es Salaam', area_sqm=Decimal('50000.00'),
    )


@pytest.fixture
def document(db, document_officer, acquisition):
    doc = Document.objects.create(
        title='Title Deed', document_type=Document.DocumentType.PDF, uploaded_by=document_officer,
        content_type=None, object_id='',
    )
    version = DocumentVersion.objects.create(
        document=doc, version_number=1,
        file=SimpleUploadedFile('deed.pdf', b'%PDF-1.4 stub', content_type='application/pdf'),
        uploaded_by=document_officer,
    )
    doc.current_version = version
    doc.save(update_fields=['current_version'])
    return doc


@pytest.mark.django_db
def test_str_returns_title(document):
    assert str(document) == 'Title Deed'


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    response = api_client.get(reverse('document-list'))
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_role_without_permission_gets_403(api_client, customer, document):
    api_client.force_authenticate(user=customer)
    response = api_client.get(reverse('document-list'))
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_create_requires_file(api_client, legal_officer):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('document-list'), {'title': 'Missing file'}, format='multipart')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'file' in response.data


@pytest.mark.django_db
def test_authorized_role_can_create_document_with_initial_version(api_client, legal_officer, acquisition):
    api_client.force_authenticate(user=legal_officer)
    upload = SimpleUploadedFile('title-deed.pdf', b'%PDF-1.4 stub', content_type='application/pdf')

    response = api_client.post(reverse('document-list'), {
        'title': 'Title Deed', 'document_type': 'pdf',
        'content_type': 'acquisitions.landacquisition', 'object_id': str(acquisition.id),
        'file': upload,
    }, format='multipart')

    assert response.status_code == status.HTTP_201_CREATED
    created = Document.objects.get(id=response.data['id'])
    assert created.uploaded_by_id == legal_officer.id
    assert created.object_id == str(acquisition.id)
    assert created.content_type.model == 'landacquisition'
    assert created.current_version.version_number == 1
    assert created.current_version.file_size is not None
    assert created.current_version.mime_type == 'application/pdf'
    assert response.data['content_type'] == 'acquisitions.landacquisition'


@pytest.mark.django_db
def test_filter_by_content_type_and_object_id(api_client, legal_officer, document_officer, acquisition):
    Document.objects.create(
        title='Unrelated', uploaded_by=document_officer,
    )
    attached = Document.objects.create(
        title='Attached to acquisition', uploaded_by=document_officer,
        content_type=None,
    )
    from django.contrib.contenttypes.models import ContentType
    attached.content_type = ContentType.objects.get_for_model(LandAcquisition)
    attached.object_id = str(acquisition.id)
    attached.save(update_fields=['content_type', 'object_id'])

    api_client.force_authenticate(user=legal_officer)
    response = api_client.get(reverse('document-list'), {
        'content_type': 'acquisitions.landacquisition', 'object_id': str(acquisition.id),
    })

    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['id'] == str(attached.id)


@pytest.mark.django_db
def test_search_by_title(api_client, legal_officer, document):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.get(reverse('document-list'), {'search': 'Title Deed'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1


@pytest.mark.django_db
def test_upload_version_creates_new_version_and_updates_current(api_client, legal_officer, document):
    api_client.force_authenticate(user=legal_officer)
    upload = SimpleUploadedFile('deed-v2.pdf', b'%PDF-1.4 v2 stub', content_type='application/pdf')

    response = api_client.post(
        reverse('document-upload-version', args=[document.id]), {'file': upload, 'notes': 'Re-signed copy'},
        format='multipart',
    )

    assert response.status_code == status.HTTP_201_CREATED
    document.refresh_from_db()
    assert document.versions.count() == 2
    assert document.current_version.version_number == 2
    assert document.current_version.notes == 'Re-signed copy'


@pytest.mark.django_db
def test_upload_version_requires_file(api_client, legal_officer, document):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.post(reverse('document-upload-version', args=[document.id]), {})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_version_number_unique_per_document(document):
    with pytest.raises(Exception):
        DocumentVersion.objects.create(
            document=document, version_number=1,
            file=SimpleUploadedFile('dup.pdf', b'stub'),
        )


@pytest.mark.django_db
def test_document_version_viewset_filtered_by_document(api_client, legal_officer, document):
    api_client.force_authenticate(user=legal_officer)
    response = api_client.get(reverse('documentversion-list'), {'document': str(document.id)})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert response.data['results'][0]['version_number'] == 1
