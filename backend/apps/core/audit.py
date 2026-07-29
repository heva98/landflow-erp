"""
Generic audit-log wiring. Call `register_for_audit(Model)` once for any model
that should have its create/update/delete actions recorded to `AuditLog`
(typically from the owning app's `apps.py: ready()`).
"""

from django.db.models.signals import post_delete, post_save
from django.forms.models import model_to_dict


def register_for_audit(model):
    dispatch_uid = f'{model.__module__}.{model.__name__}'
    post_save.connect(_on_save, sender=model, dispatch_uid=f'audit_save:{dispatch_uid}')
    post_delete.connect(_on_delete, sender=model, dispatch_uid=f'audit_delete:{dispatch_uid}')
    return model


def _serialize(instance):
    return {key: str(value) for key, value in model_to_dict(instance).items()}


def _write_log(sender, instance, action):
    from django.contrib.contenttypes.models import ContentType

    from .models import AuditLog

    AuditLog.objects.create(
        content_type=ContentType.objects.get_for_model(sender),
        object_id=str(instance.pk),
        object_repr=str(instance)[:255],
        action=action,
        changes=_serialize(instance),
        actor=getattr(instance, '_audit_actor', None),
    )


def _on_save(sender, instance, created, **kwargs):
    from .models import AuditLog

    _write_log(sender, instance, AuditLog.Action.CREATE if created else AuditLog.Action.UPDATE)


def _on_delete(sender, instance, **kwargs):
    from .models import AuditLog

    _write_log(sender, instance, AuditLog.Action.DELETE)
