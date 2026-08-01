from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.core.models import BaseModel
from apps.crm.models import Customer


class Notification(BaseModel):
    class Channel(models.TextChoices):
        EMAIL = 'email', 'Email'
        SMS = 'sms', 'SMS'
        WHATSAPP = 'whatsapp', 'WhatsApp'

    class Type(models.TextChoices):
        INSTALLMENT_DUE_REMINDER = 'installment_due_reminder', 'Installment Due Reminder'
        INSTALLMENT_OVERDUE_ALERT = 'installment_overdue_alert', 'Installment Overdue Alert'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    notification_type = models.CharField(max_length=50, choices=Type.choices)
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.EMAIL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    # Generic link to the record that triggered this notification (an
    # Installment today; any future module's model without a new FK here).
    # Combined with the unique constraint below, this is also what stops the
    # daily beat tasks from sending the same reminder twice.
    content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT, related_name='notifications')
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')

    recipient_customer = models.ForeignKey(
        Customer, null=True, blank=True, on_delete=models.SET_NULL, related_name='notifications',
    )
    recipient_email = models.EmailField()

    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField(blank=True)

    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['notification_type', 'content_type', 'object_id'],
                name='unique_notification_per_source_and_type',
            ),
        ]

    def __str__(self):
        return f'{self.get_notification_type_display()} to {self.recipient_email} ({self.status})'
