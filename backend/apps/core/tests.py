import uuid

import pytest
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_delete, post_save

from apps.core.audit import register_for_audit
from apps.core.models import AuditLog

User = get_user_model()


@pytest.fixture
def audited_user_model():
    register_for_audit(User)
    yield User
    dispatch_uid = f'{User.__module__}.{User.__name__}'
    post_save.disconnect(sender=User, dispatch_uid=f'audit_save:{dispatch_uid}')
    post_delete.disconnect(sender=User, dispatch_uid=f'audit_delete:{dispatch_uid}')


@pytest.mark.django_db
def test_base_model_fields():
    log = AuditLog.objects.create(
        content_type=ContentType.objects.get_for_model(AuditLog),
        object_id='1',
        object_repr='seed entry',
        action=AuditLog.Action.CREATE,
    )
    assert isinstance(log.id, uuid.UUID)
    assert log.created_at is not None
    assert log.updated_at is not None


@pytest.mark.django_db
def test_register_for_audit_records_create_and_update(audited_user_model):
    user = User.objects.create_user(username='jane', password='pw-12345')
    create_log = AuditLog.objects.get(action=AuditLog.Action.CREATE, object_id=str(user.pk))
    assert create_log.content_type == ContentType.objects.get_for_model(User)

    user.first_name = 'Jane'
    user.save()
    assert AuditLog.objects.filter(action=AuditLog.Action.UPDATE, object_id=str(user.pk)).exists()


@pytest.mark.django_db
def test_register_for_audit_records_delete(audited_user_model):
    user = User.objects.create_user(username='john', password='pw-12345')
    user_pk = str(user.pk)
    user.delete()
    assert AuditLog.objects.filter(action=AuditLog.Action.DELETE, object_id=user_pk).exists()


@pytest.mark.django_db
def test_audit_log_is_immutable():
    log = AuditLog.objects.create(
        content_type=ContentType.objects.get_for_model(AuditLog),
        object_id='1',
        object_repr='seed entry',
        action=AuditLog.Action.CREATE,
    )

    log.object_repr = 'changed'
    with pytest.raises(ValueError):
        log.save()

    with pytest.raises(ValueError):
        log.delete()
