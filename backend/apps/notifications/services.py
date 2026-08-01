"""
Email backend for the notifications app. `send_notification` is the entry
point other apps call — it renders the templates for `notification_type`,
records a `Notification` row, and sends the email.

Sending is idempotent: Notification's unique constraint on
(notification_type, content_type, object_id) means a second call for the
same source object either finds a SENT row and skips, or retries a previous
FAILED attempt.
"""

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone

from .models import Notification


def send_notification(*, notification_type, content_object, recipient_email, context, recipient_customer=None):
    """
    Returns the Notification, or None if one was already sent previously for
    this (notification_type, content_object) and this call was skipped.
    Never raises on send failure — the failure is recorded on the
    Notification instead so the caller can just count what got sent.
    """
    content_type = ContentType.objects.get_for_model(content_object)
    notification, created = Notification.objects.get_or_create(
        notification_type=notification_type,
        content_type=content_type,
        object_id=str(content_object.pk),
        defaults={
            'channel': Notification.Channel.EMAIL,
            'recipient_email': recipient_email,
            'recipient_customer': recipient_customer,
        },
    )
    if not created and notification.status == Notification.Status.SENT:
        return None

    subject = render_to_string(f'notifications/emails/{notification_type}_subject.txt', context).strip()
    body = render_to_string(f'notifications/emails/{notification_type}_body.txt', context)

    notification.recipient_email = recipient_email
    notification.recipient_customer = recipient_customer
    notification.subject = subject
    notification.body = body

    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [recipient_email], fail_silently=False)
    except Exception as exc:
        notification.status = Notification.Status.FAILED
        notification.error_message = str(exc)
    else:
        notification.status = Notification.Status.SENT
        notification.sent_at = timezone.now()
        notification.error_message = ''

    notification.save()
    return notification
