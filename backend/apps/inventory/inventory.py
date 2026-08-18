"""
Inventory rows are computed on the fly from Plot/Project data — nothing here
is stored (spec Module 16: "mostly read-only aggregation"). Shaped the same
{rows, summary} way as apps.reports, since this is effectively a purpose-
built operational view over the same land-inventory data reports.py already
aggregates for ad-hoc reporting/export.
"""

from decimal import Decimal

from django.db.models import Count, Sum

from apps.plots.models import Plot
from apps.projects.models import Project


def _plot_row(plot):
    return {
        'project': plot.project.name,
        'plot_number': plot.plot_number,
        'block': plot.block,
        'street': plot.street,
        'area_sqm': plot.area_sqm,
        'price': plot.price,
        'final_price': plot.final_price,
        'owner': plot.owner.full_name if plot.owner else '',
    }


def plots_by_status_report(status, *, project=None):
    """Backs the Unsold / Reserved / Transferred views — all three are just
    this same aggregation scoped to a different Plot.Status."""
    queryset = Plot.objects.select_related('project', 'owner').filter(status=status)
    if project:
        queryset = queryset.filter(project_id=project)

    rows = [_plot_row(plot) for plot in queryset.order_by('project__name', 'plot_number')]
    totals = queryset.aggregate(area_sqm=Sum('area_sqm'), price=Sum('price'))

    return {
        'rows': rows,
        'summary': {
            'count': len(rows),
            'total_area_sqm': totals['area_sqm'] or Decimal('0'),
            'total_price': totals['price'] or Decimal('0'),
        },
    }


def available_area_report(*, project=None):
    """Available (unsold) area broken down per project — "how much land is
    left to sell" is the whole point of this view, so it's grouped by
    project rather than listed plot-by-plot like the status views above."""
    queryset = Plot.objects.filter(status=Plot.Status.AVAILABLE)
    if project:
        queryset = queryset.filter(project_id=project)

    by_project = (
        queryset.values('project_id', 'project__name')
        .annotate(available_plot_count=Count('id'), available_area_sqm=Sum('area_sqm'))
        .order_by('project__name')
    )
    rows = [
        {
            'project': row['project__name'],
            'available_plot_count': row['available_plot_count'],
            'available_area_sqm': row['available_area_sqm'] or Decimal('0'),
        }
        for row in by_project
    ]
    totals = queryset.aggregate(area_sqm=Sum('area_sqm'), count=Count('id'))

    return {
        'rows': rows,
        'summary': {
            'count': totals['count'] or 0,
            'total_area_sqm': totals['area_sqm'] or Decimal('0'),
        },
    }


def future_projects_report():
    """Projects not yet in the Selling phase — Planning or Development."""
    queryset = Project.objects.filter(status__in=[Project.Status.PLANNING, Project.Status.DEVELOPMENT])
    plot_counts = dict(
        Plot.objects.filter(project__in=queryset).values_list('project_id').annotate(count=Count('id')),
    )

    rows = [
        {
            'project': project.name,
            'status': project.get_status_display(),
            'location': project.location,
            'total_area_sqm': project.total_area_sqm,
            'plot_count': plot_counts.get(project.id, 0),
            'start_date': project.start_date,
            'expected_completion_date': project.expected_completion_date,
        }
        for project in queryset.order_by('start_date')
    ]
    totals = queryset.aggregate(total_area_sqm=Sum('total_area_sqm'))

    return {
        'rows': rows,
        'summary': {'count': len(rows), 'total_area_sqm': totals['total_area_sqm'] or Decimal('0')},
    }


def overview_summary():
    """One combined KPI payload for the top of the Inventory page — same
    "single round trip" reasoning as reports.dashboard_summary."""
    status_rows = Plot.objects.filter(
        status__in=[Plot.Status.AVAILABLE, Plot.Status.RESERVED, Plot.Status.TRANSFERRED],
    ).values('status').annotate(count=Count('id'), area_sqm=Sum('area_sqm'))
    by_status = {row['status']: row for row in status_rows}

    def _stat(status):
        row = by_status.get(status)
        if not row:
            return {'count': 0, 'area_sqm': Decimal('0')}
        return {'count': row['count'], 'area_sqm': row['area_sqm'] or Decimal('0')}

    future_projects_count = Project.objects.filter(
        status__in=[Project.Status.PLANNING, Project.Status.DEVELOPMENT],
    ).count()

    return {
        'unsold': _stat(Plot.Status.AVAILABLE),
        'reserved': _stat(Plot.Status.RESERVED),
        'transferred': _stat(Plot.Status.TRANSFERRED),
        'future_projects_count': future_projects_count,
    }
