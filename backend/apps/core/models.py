import uuid

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import models


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuditLog(BaseModel):
    class Action(models.TextChoices):
        CREATE = 'create', 'Create'
        UPDATE = 'update', 'Update'
        DELETE = 'delete', 'Delete'

    content_type = models.ForeignKey(
        ContentType, on_delete=models.PROTECT, related_name='audit_logs',
    )
    object_id = models.CharField(max_length=255)
    object_repr = models.CharField(max_length=255)
    action = models.CharField(max_length=10, choices=Action.choices)
    changes = models.JSONField(default=dict, blank=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='audit_logs',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_action_display()} {self.content_type} #{self.object_id}'

    def save(self, *args, **kwargs):
        if self.pk and AuditLog.objects.filter(pk=self.pk).exists():
            raise ValueError('AuditLog entries are immutable and cannot be updated.')
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError('AuditLog entries are immutable and cannot be deleted.')
