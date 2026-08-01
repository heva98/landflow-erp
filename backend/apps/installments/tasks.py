from celery import shared_task
from django.utils import timezone

from .models import Installment


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
