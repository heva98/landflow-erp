import pytest
from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError, transaction

from apps.crm.models import Customer

from .models import Notification


@pytest.fixture
def customer(db):
    return Customer.objects.create(full_name='Juma Hassan', phone='+255700000000', email='juma@example.com')


@pytest.mark.django_db
def test_duplicate_notification_for_same_source_and_type_is_rejected(customer):
    content_type = ContentType.objects.get_for_model(Customer)
    Notification.objects.create(
        notification_type=Notification.Type.INSTALLMENT_DUE_REMINDER,
        content_type=content_type, object_id=str(customer.id), recipient_email=customer.email,
    )
    with pytest.raises(IntegrityError):
        with transaction.atomic():
            Notification.objects.create(
                notification_type=Notification.Type.INSTALLMENT_DUE_REMINDER,
                content_type=content_type, object_id=str(customer.id), recipient_email=customer.email,
            )


@pytest.mark.django_db
def test_different_notification_type_for_same_source_is_allowed(customer):
    content_type = ContentType.objects.get_for_model(Customer)
    Notification.objects.create(
        notification_type=Notification.Type.INSTALLMENT_DUE_REMINDER,
        content_type=content_type, object_id=str(customer.id), recipient_email=customer.email,
    )
    Notification.objects.create(
        notification_type=Notification.Type.INSTALLMENT_OVERDUE_ALERT,
        content_type=content_type, object_id=str(customer.id), recipient_email=customer.email,
    )
    assert Notification.objects.count() == 2
