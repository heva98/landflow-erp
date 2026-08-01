from celery import shared_task
from django.utils import timezone

from apps.notifications.models import Notification
from apps.notifications.services import send_notification

from .models import Installment

# How many days before an installment's due_date to send the reminder email.
DUE_REMINDER_DAYS_BEFORE = 3


@shared_task
def flag_overdue_installments():
    """
    Marks unpaid installments past their grace period as Overdue. A late
    partial payment can move an installment back out of Overdue (see
    InstallmentPaymentSerializer); if it's still unpaid on the next run it's
    re-flagged here, but flagged_overdue_at guards against charging the
    one-time penalty twice.
    """
    today = timezone.localdate()
    candidates = Installment.objects.exclude(
        status__in=[Installment.Status.PAID, Installment.Status.OVERDUE],
    ).select_related('payment_plan')

    flagged_count = 0
    for installment in candidates:
        overdue_since = installment.due_date + timezone.timedelta(days=installment.payment_plan.grace_period_days)
        if overdue_since >= today:
            continue

        update_fields = ['status', 'updated_at']
        installment.status = Installment.Status.OVERDUE
        if installment.flagged_overdue_at is None:
            penalty_rate = installment.payment_plan.penalty_rate
            installment.penalty_amount += installment.amount_due * penalty_rate / 100
            installment.flagged_overdue_at = timezone.now()
            update_fields += ['penalty_amount', 'flagged_overdue_at']
        installment.save(update_fields=update_fields)
        flagged_count += 1

    return flagged_count


def _installment_email_context(installment):
    plan = installment.payment_plan
    sale = plan.sale
    return {
        'customer_name': sale.customer.full_name,
        'project_name': sale.plot.project.name,
        'plot_number': sale.plot.plot_number,
        'sale_number': sale.sale_number,
        'sequence': installment.sequence,
        'total_installments': plan.number_of_installments,
        'due_date': installment.due_date,
        'amount_due': installment.amount_due,
        'penalty_amount': installment.penalty_amount,
        'balance': installment.balance,
    }


@shared_task
def send_installment_due_reminders():
    """
    Emails a one-time reminder for installments due in DUE_REMINDER_DAYS_BEFORE
    days. Customers without an email on file are skipped; Notification's
    unique constraint stops a later run from re-sending an already-sent one.
    """
    target_date = timezone.localdate() + timezone.timedelta(days=DUE_REMINDER_DAYS_BEFORE)
    candidates = Installment.objects.filter(due_date=target_date).exclude(
        status=Installment.Status.PAID,
    ).select_related('payment_plan__sale__customer', 'payment_plan__sale__plot__project')

    sent_count = 0
    for installment in candidates:
        customer = installment.payment_plan.sale.customer
        if not customer.email:
            continue
        notification = send_notification(
            notification_type=Notification.Type.INSTALLMENT_DUE_REMINDER,
            content_object=installment,
            recipient_email=customer.email,
            recipient_customer=customer,
            context=_installment_email_context(installment),
        )
        if notification and notification.status == Notification.Status.SENT:
            sent_count += 1

    return sent_count


@shared_task
def send_installment_overdue_alerts():
    """
    Emails a one-time overdue alert the first time an installment is Overdue.
    Relies on flag_overdue_installments having already run; Notification's
    unique constraint stops a later run from re-sending an already-sent one.
    """
    candidates = Installment.objects.filter(status=Installment.Status.OVERDUE).select_related(
        'payment_plan__sale__customer', 'payment_plan__sale__plot__project',
    )

    sent_count = 0
    for installment in candidates:
        customer = installment.payment_plan.sale.customer
        if not customer.email:
            continue
        notification = send_notification(
            notification_type=Notification.Type.INSTALLMENT_OVERDUE_ALERT,
            content_object=installment,
            recipient_email=customer.email,
            recipient_customer=customer,
            context=_installment_email_context(installment),
        )
        if notification and notification.status == Notification.Status.SENT:
            sent_count += 1

    return sent_count
