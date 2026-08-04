"""
Report rows are computed on the fly from existing module data — nothing here
is stored. Each function returns a dict shaped {rows, summary} where `rows`
mirrors the columns used for both the on-screen table and the Excel/PDF
exports (see export.py), so there's one source of truth for column order.
"""

from decimal import Decimal

from django.db.models import Count, Sum

from apps.crm.models import Lead
from apps.finance import reports as finance_reports
from apps.installments.models import Installment
from apps.plots.models import Plot
from apps.sales.models import Sale


def sales_report(*, project=None, date_from=None, date_to=None, sale_type=None, status=None, sold_by=None):
    queryset = Sale.objects.select_related('plot__project', 'customer', 'sold_by')
    if project:
        queryset = queryset.filter(plot__project_id=project)
    if date_from:
        queryset = queryset.filter(sold_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(sold_at__date__lte=date_to)
    if sale_type:
        queryset = queryset.filter(sale_type=sale_type)
    if status:
        queryset = queryset.filter(status=status)
    if sold_by:
        queryset = queryset.filter(sold_by_id=sold_by)

    rows = [
        {
            'sale_number': sale.sale_number,
            'sold_at': sale.sold_at,
            'project': sale.plot.project.name,
            'plot_number': sale.plot.plot_number,
            'customer': sale.customer.full_name,
            'sale_type': sale.get_sale_type_display(),
            'status': sale.get_status_display(),
            'sale_price': sale.sale_price,
            'discount': sale.discount,
            'net_price': sale.net_price,
            'down_payment': sale.down_payment,
            'balance_due': sale.balance_due,
            'sold_by': sale.sold_by.get_full_name() if sale.sold_by else '',
        }
        for sale in queryset.order_by('-sold_at')
    ]

    totals = queryset.aggregate(
        sale_price=Sum('sale_price'), discount=Sum('discount'), down_payment=Sum('down_payment'),
    )
    total_sale_price = totals['sale_price'] or Decimal('0')
    total_discount = totals['discount'] or Decimal('0')
    total_down_payment = totals['down_payment'] or Decimal('0')
    total_net_price = total_sale_price - total_discount

    return {
        'rows': rows,
        'summary': {
            'count': len(rows),
            'total_sale_price': total_sale_price,
            'total_discount': total_discount,
            'total_net_price': total_net_price,
            'total_down_payment': total_down_payment,
            'total_balance_due': total_net_price - total_down_payment,
        },
    }


def installment_report(*, project=None, status=None, due_date_from=None, due_date_to=None):
    queryset = Installment.objects.select_related(
        'payment_plan__sale__customer', 'payment_plan__sale__plot__project',
    )
    if project:
        queryset = queryset.filter(payment_plan__sale__plot__project_id=project)
    if status:
        queryset = queryset.filter(status=status)
    if due_date_from:
        queryset = queryset.filter(due_date__gte=due_date_from)
    if due_date_to:
        queryset = queryset.filter(due_date__lte=due_date_to)

    rows = [
        {
            'sale_number': installment.payment_plan.sale.sale_number,
            'customer': installment.payment_plan.sale.customer.full_name,
            'project': installment.payment_plan.sale.plot.project.name,
            'plot_number': installment.payment_plan.sale.plot.plot_number,
            'sequence': installment.sequence,
            'due_date': installment.due_date,
            'amount_due': installment.amount_due,
            'penalty_amount': installment.penalty_amount,
            'amount_paid': installment.amount_paid,
            'balance': installment.balance,
            'status': installment.get_status_display(),
        }
        for installment in queryset.order_by('due_date')
    ]

    totals = queryset.aggregate(
        amount_due=Sum('amount_due'), penalty_amount=Sum('penalty_amount'), amount_paid=Sum('amount_paid'),
    )
    total_amount_due = totals['amount_due'] or Decimal('0')
    total_penalty = totals['penalty_amount'] or Decimal('0')
    total_paid = totals['amount_paid'] or Decimal('0')

    return {
        'rows': rows,
        'summary': {
            'count': len(rows),
            'total_amount_due': total_amount_due,
            'total_penalty': total_penalty,
            'total_paid': total_paid,
            'total_balance': total_amount_due + total_penalty - total_paid,
        },
    }


def lead_report(*, project=None, source=None, status=None, assigned_to=None, date_from=None, date_to=None):
    queryset = Lead.objects.select_related('interested_project', 'assigned_to')
    if project:
        queryset = queryset.filter(interested_project_id=project)
    if source:
        queryset = queryset.filter(source=source)
    if status:
        queryset = queryset.filter(status=status)
    if assigned_to:
        queryset = queryset.filter(assigned_to_id=assigned_to)
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)

    rows = [
        {
            'full_name': lead.full_name,
            'phone': lead.phone,
            'email': lead.email,
            'source': lead.get_source_display(),
            'status': lead.get_status_display(),
            'interested_project': lead.interested_project.name if lead.interested_project else '',
            'assigned_to': lead.assigned_to.get_full_name() if lead.assigned_to else '',
            'created_at': lead.created_at,
        }
        for lead in queryset.order_by('-created_at')
    ]

    total = queryset.count()
    by_status = dict(queryset.values_list('status').annotate(count=Count('id')).order_by())
    by_source = dict(queryset.values_list('source').annotate(count=Count('id')).order_by())
    purchased = by_status.get(Lead.Status.PURCHASED, 0)

    return {
        'rows': rows,
        'summary': {
            'count': total,
            'by_status': by_status,
            'by_source': by_source,
            'conversion_rate': (Decimal(purchased) / total * 100) if total else Decimal('0'),
        },
    }


def land_inventory_report(*, project=None, status=None):
    queryset = Plot.objects.select_related('project', 'owner')
    if project:
        queryset = queryset.filter(project_id=project)
    if status:
        queryset = queryset.filter(status=status)

    rows = [
        {
            'project': plot.project.name,
            'plot_number': plot.plot_number,
            'block': plot.block,
            'street': plot.street,
            'status': plot.get_status_display(),
            'area_sqm': plot.area_sqm,
            'price': plot.price,
            'discount': plot.discount,
            'final_price': plot.final_price,
            'owner': plot.owner.full_name if plot.owner else '',
        }
        for plot in queryset.order_by('project__name', 'plot_number')
    ]

    totals = queryset.aggregate(area_sqm=Sum('area_sqm'), price=Sum('price'), discount=Sum('discount'))
    total_area = totals['area_sqm'] or Decimal('0')
    total_price = totals['price'] or Decimal('0')
    total_discount = totals['discount'] or Decimal('0')
    by_status = dict(queryset.values_list('status').annotate(count=Count('id')).order_by())

    return {
        'rows': rows,
        'summary': {
            'count': len(rows),
            'total_area_sqm': total_area,
            'total_price': total_price,
            'total_final_price': total_price - total_discount,
            'by_status': by_status,
        },
    }


def cash_flow_report(*, date_from, date_to):
    data = finance_reports.cash_flow(date_from, date_to)
    rows = [
        {
            'name': account['name'],
            'kind': account['kind'],
            'opening_balance': account['opening_balance'],
            'inflow': account['inflow'],
            'outflow': account['outflow'],
            'closing_balance': account['closing_balance'],
        }
        for account in data['accounts']
    ]
    return {
        'rows': rows,
        'summary': {
            'count': len(rows),
            'total_inflow': data['total_inflow'],
            'total_outflow': data['total_outflow'],
            'net_cash_flow': data['net_cash_flow'],
        },
    }


# Column order/labels for the Excel and PDF exports — kept next to the row
# builders above so the two stay in sync.

SALES_COLUMNS = [
    ('sale_number', 'Sale #'), ('sold_at', 'Sold At'), ('project', 'Project'), ('plot_number', 'Plot #'),
    ('customer', 'Customer'), ('sale_type', 'Type'), ('status', 'Status'), ('sale_price', 'Sale Price'),
    ('discount', 'Discount'), ('net_price', 'Net Price'), ('down_payment', 'Down Payment'),
    ('balance_due', 'Balance Due'), ('sold_by', 'Sold By'),
]
SALES_SUMMARY_LABELS = [
    ('count', 'Number of Sales'), ('total_sale_price', 'Total Sale Price'), ('total_discount', 'Total Discount'),
    ('total_net_price', 'Total Net Price'), ('total_down_payment', 'Total Down Payment'),
    ('total_balance_due', 'Total Balance Due'),
]

INSTALLMENT_COLUMNS = [
    ('sale_number', 'Sale #'), ('customer', 'Customer'), ('project', 'Project'), ('plot_number', 'Plot #'),
    ('sequence', 'Installment #'), ('due_date', 'Due Date'), ('amount_due', 'Amount Due'),
    ('penalty_amount', 'Penalty'), ('amount_paid', 'Amount Paid'), ('balance', 'Balance'), ('status', 'Status'),
]
INSTALLMENT_SUMMARY_LABELS = [
    ('count', 'Number of Installments'), ('total_amount_due', 'Total Amount Due'),
    ('total_penalty', 'Total Penalty'), ('total_paid', 'Total Paid'), ('total_balance', 'Total Balance'),
]

LEAD_COLUMNS = [
    ('full_name', 'Full Name'), ('phone', 'Phone'), ('email', 'Email'), ('source', 'Source'),
    ('status', 'Status'), ('interested_project', 'Interested Project'), ('assigned_to', 'Assigned To'),
    ('created_at', 'Created At'),
]
LEAD_SUMMARY_LABELS = [
    ('count', 'Total Leads'), ('by_status', 'By Status'), ('by_source', 'By Source'),
    ('conversion_rate', 'Conversion Rate (%)'),
]

LAND_INVENTORY_COLUMNS = [
    ('project', 'Project'), ('plot_number', 'Plot #'), ('block', 'Block'), ('street', 'Street'),
    ('status', 'Status'), ('area_sqm', 'Area (sqm)'), ('price', 'Price'), ('discount', 'Discount'),
    ('final_price', 'Final Price'), ('owner', 'Owner'),
]
LAND_INVENTORY_SUMMARY_LABELS = [
    ('count', 'Number of Plots'), ('total_area_sqm', 'Total Area (sqm)'), ('total_price', 'Total Price'),
    ('total_final_price', 'Total Final Price'), ('by_status', 'By Status'),
]

CASH_FLOW_COLUMNS = [
    ('name', 'Account'), ('kind', 'Kind'), ('opening_balance', 'Opening Balance'), ('inflow', 'Inflow'),
    ('outflow', 'Outflow'), ('closing_balance', 'Closing Balance'),
]
CASH_FLOW_SUMMARY_LABELS = [
    ('count', 'Number of Accounts'), ('total_inflow', 'Total Inflow'), ('total_outflow', 'Total Outflow'),
    ('net_cash_flow', 'Net Cash Flow'),
]
