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
    `recipient_email` is a single address or a list — e.g. every Legal
    Officer, for an ownership-transfer alert. One Notification row records
    the whole send (its uniqueness key doesn't include the recipient), so a
    second call with a different recipient list for the same source object
    still just finds the existing SENT row and skips.

    Returns the Notification, or None if there was nothing to send to, or one
    was already sent previously for this (notification_type, content_object)
    and this call was skipped. Never raises on send failure — the failure is
    recorded on the Notification instead so the caller can just count what
    got sent.
    """
    recipients = list(recipient_email) if isinstance(recipient_email, (list, tuple)) else [recipient_email]
    if not recipients:
        return None

    content_type = ContentType.objects.get_for_model(content_object)
    notification, created = Notification.objects.get_or_create(
        notification_type=notification_type,
        content_type=content_type,
        object_id=str(content_object.pk),
        defaults={
            'channel': Notification.Channel.EMAIL,
            'recipient_email': ', '.join(recipients),
            'recipient_customer': recipient_customer,
        },
    )
    if not created and notification.status == Notification.Status.SENT:
        return None

    subject = render_to_string(f'notifications/emails/{notification_type}_subject.txt', context).strip()
    body = render_to_string(f'notifications/emails/{notification_type}_body.txt', context)

    notification.recipient_email = ', '.join(recipients)
    notification.recipient_customer = recipient_customer
    notification.subject = subject
    notification.body = body

    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, recipients, fail_silently=False)
    except Exception as exc:
        notification.status = Notification.Status.FAILED
        notification.error_message = str(exc)
    else:
        notification.status = Notification.Status.SENT
        notification.sent_at = timezone.now()
        notification.error_message = ''

    notification.save()
    return notification
