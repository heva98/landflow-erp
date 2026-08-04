"""
Data for the Dashboard page (spec: Dashboard section) — one combined payload
rather than one call per widget, so the page loads in a single round trip.

Each section is gated on the same view permission a user would need to browse
that data directly (mirrors reports.py), and is set to `None` rather than
omitted when the requesting user lacks it, so the frontend can hide that
widget without special-casing a missing key.
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, F, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone

from apps.crm.models import Lead
from apps.finance.models import Income
from apps.installments.models import Installment, PaymentPlan
from apps.plots.models import Plot
from apps.sales.models import Sale

UPCOMING_PAYMENT_WINDOW_DAYS = 30
UPCOMING_PAYMENT_ROW_LIMIT = 10
MONTHLY_SALES_MONTHS = 12
TOP_AGENTS_LIMIT = 5
RECENT_ACTIVITY_LIMIT = 15


def _decimal(value):
    return value if value is not None else Decimal('0')


def _revenue_section(user):
    if not user.has_perm('finance.view_income'):
        return None
    today = timezone.localdate()
    todays_total = Income.objects.filter(date=today).aggregate(total=Sum('amount'))['total']
    month_total = Income.objects.filter(date__year=today.year, date__month=today.month).aggregate(
        total=Sum('amount'),
    )['total']
    return {'today': _decimal(todays_total), 'this_month': _decimal(month_total)}


def _plots_section(user):
    if not user.has_perm('plots.view_plot'):
        return None
    counts = dict(
        Plot.objects.filter(
            status__in=[Plot.Status.AVAILABLE, Plot.Status.RESERVED, Plot.Status.SOLD],
        ).values_list('status').annotate(count=Count('id')),
    )
    return {
        'available': counts.get(Plot.Status.AVAILABLE, 0),
        'reserved': counts.get(Plot.Status.RESERVED, 0),
        'sold': counts.get(Plot.Status.SOLD, 0),
    }


def _leads_section(user):
    if not user.has_perm('crm.view_lead'):
        return None
    today = timezone.localdate()
    return {
        'new_today': Lead.objects.filter(created_at__date=today).count(),
        'new_this_month': Lead.objects.filter(created_at__year=today.year, created_at__month=today.month).count(),
    }


def _pending_transfers(user):
    """Sold plots whose sale has been paid off in full but hasn't moved to
    Transferred yet — the day-to-day queue for the legal/transfer team.
    Cash/corporate/bulk sales are paid off the moment `down_payment` covers
    the net price; installment sales are paid off once their payment plan
    completes."""
    if not user.has_perm('plots.view_plot'):
        return None

    paid_off_non_installment = Sale.objects.filter(
        status=Sale.Status.ACTIVE, plot__status=Plot.Status.SOLD,
    ).exclude(sale_type=Sale.SaleType.INSTALLMENT).filter(
        down_payment__gte=F('sale_price') - F('discount'),
    ).values_list('plot_id', flat=True)

    paid_off_installment = Sale.objects.filter(
        status=Sale.Status.ACTIVE, plot__status=Plot.Status.SOLD, sale_type=Sale.SaleType.INSTALLMENT,
        payment_plan__status=PaymentPlan.Status.COMPLETED,
    ).values_list('plot_id', flat=True)

    return len(set(paid_off_non_installment) | set(paid_off_installment))


def _outstanding_balances(user):
    """Money still owed to the company: the unpaid remainder of non-
    installment sales (down payment short of net price) plus the outstanding
    balance across active/defaulted payment plans."""
    if not (user.has_perm('sales.view_sale') and user.has_perm('installments.view_installment')):
        return None

    non_installment_totals = Sale.objects.filter(status=Sale.Status.ACTIVE).exclude(
        sale_type=Sale.SaleType.INSTALLMENT,
    ).aggregate(total=Sum(F('sale_price') - F('discount') - F('down_payment')))
    non_installment_outstanding = _decimal(non_installment_totals['total'])

    installment_totals = Installment.objects.filter(
        payment_plan__status__in=[PaymentPlan.Status.ACTIVE, PaymentPlan.Status.DEFAULTED],
    ).aggregate(due=Sum('amount_due'), penalty=Sum('penalty_amount'), paid=Sum('amount_paid'))
    installment_outstanding = (
        _decimal(installment_totals['due']) + _decimal(installment_totals['penalty'])
        - _decimal(installment_totals['paid'])
    )

    return non_installment_outstanding + installment_outstanding


def _upcoming_payments(user):
    if not user.has_perm('installments.view_installment'):
        return None

    queryset = Installment.objects.select_related(
        'payment_plan__sale__customer', 'payment_plan__sale__plot__project',
    ).filter(
        status__in=[Installment.Status.PENDING, Installment.Status.PARTIAL, Installment.Status.OVERDUE],
        due_date__lte=timezone.localdate() + timedelta(days=UPCOMING_PAYMENT_WINDOW_DAYS),
    ).order_by('due_date')

    totals = queryset.aggregate(due=Sum('amount_due'), penalty=Sum('penalty_amount'), paid=Sum('amount_paid'))
    total_balance = (
        _decimal(totals['due']) + _decimal(totals['penalty']) - _decimal(totals['paid'])
    )

    rows = [
        {
            'sale_number': installment.payment_plan.sale.sale_number,
            'customer': installment.payment_plan.sale.customer.full_name,
            'project': installment.payment_plan.sale.plot.project.name,
            'plot_number': installment.payment_plan.sale.plot.plot_number,
            'due_date': installment.due_date,
            'balance': installment.balance,
            'status': installment.status,
        }
        for installment in queryset[:UPCOMING_PAYMENT_ROW_LIMIT]
    ]

    return {'count': queryset.count(), 'total_balance': total_balance, 'rows': rows}


def _monthly_sales(user):
    if not user.has_perm('sales.view_sale'):
        return None

    today = timezone.localdate()
    months = []
    year, month = today.year, today.month
    for _ in range(MONTHLY_SALES_MONTHS):
        months.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    months.reverse()
    range_start = today.replace(year=months[0][0], month=months[0][1], day=1)

    totals_by_month = {
        row['month'].strftime('%Y-%m'): row
        for row in Sale.objects.filter(
            status=Sale.Status.ACTIVE, sold_at__date__gte=range_start,
        ).annotate(month=TruncMonth('sold_at')).values('month').annotate(
            total=Sum(F('sale_price') - F('discount')), count=Count('id'),
        )
    }

    result = []
    for year_val, month_val in months:
        key = f'{year_val:04d}-{month_val:02d}'
        row = totals_by_month.get(key)
        result.append({
            'month': key,
            'label': f'{today.replace(year=year_val, month=month_val, day=1):%b %Y}',
            'total': _decimal(row['total']) if row else Decimal('0'),
            'count': row['count'] if row else 0,
        })
    return result


def _top_agents(user):
    if not user.has_perm('sales.view_sale'):
        return None

    today = timezone.localdate()
    rows = Sale.objects.filter(
        status=Sale.Status.ACTIVE, sold_by__isnull=False, sold_at__year=today.year, sold_at__month=today.month,
    ).values(
        'sold_by_id', 'sold_by__first_name', 'sold_by__last_name', 'sold_by__email',
    ).annotate(
        total=Sum(F('sale_price') - F('discount')), deals=Count('id'),
    ).order_by('-total')[:TOP_AGENTS_LIMIT]

    return [
        {
            'id': str(row['sold_by_id']),
            'name': f"{row['sold_by__first_name']} {row['sold_by__last_name']}".strip() or row['sold_by__email'],
            'deals': row['deals'],
            'total': _decimal(row['total']),
        }
        for row in rows
    ]


def _recent_activity(user):
    if not user.has_perm('core.view_auditlog'):
        return None

    from apps.core.models import AuditLog

    logs = AuditLog.objects.select_related('content_type', 'actor').order_by('-created_at')[:RECENT_ACTIVITY_LIMIT]
    return [
        {
            'id': str(log.id),
            'action': log.get_action_display(),
            'model': log.content_type.model if log.content_type else '',
            'object_repr': log.object_repr,
            'actor': log.actor.get_full_name() if log.actor else 'System',
            'created_at': log.created_at,
        }
        for log in logs
    ]


def dashboard_summary(user):
    return {
        'revenue': _revenue_section(user),
        'plots': _plots_section(user),
        'leads': _leads_section(user),
        'pending_transfers': _pending_transfers(user),
        'outstanding_balances': _outstanding_balances(user),
        'upcoming_payments': _upcoming_payments(user),
        'monthly_sales': _monthly_sales(user),
        'top_agents': _top_agents(user),
        'recent_activity': _recent_activity(user),
    }
