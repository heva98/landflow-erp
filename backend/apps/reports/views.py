from django.http import HttpResponse
from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from . import dashboard, export, reports
from .permissions import (
    HasFinanceReportAccess, HasInstallmentReportAccess, HasLandInventoryReportAccess, HasLeadReportAccess,
    HasSalesReportAccess,
)

EXCEL_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
PDF_CONTENT_TYPE = 'application/pdf'


def _export_response(export_format, filename, title, columns, rows, summary_lines):
    if export_format == 'xlsx':
        content = export.build_xlsx(title, columns, rows, summary_lines)
        response = HttpResponse(content, content_type=EXCEL_CONTENT_TYPE)
        response['Content-Disposition'] = f'attachment; filename="{filename}.xlsx"'
        return response
    content = export.build_pdf(title, columns, rows, summary_lines)
    response = HttpResponse(content, content_type=PDF_CONTENT_TYPE)
    response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
    return response


class ReportViewSet(viewsets.ViewSet):
    """One action per report. Without `?export=`, returns JSON {rows, summary}
    for the on-screen table; with `?export=xlsx` or `?export=pdf`, returns the
    same data rendered as a file download instead."""

    ACTION_PERMISSIONS = {
        'sales': HasSalesReportAccess,
        'installments': HasInstallmentReportAccess,
        'leads': HasLeadReportAccess,
        'land_inventory': HasLandInventoryReportAccess,
        'cash_flow': HasFinanceReportAccess,
    }

    def get_permissions(self):
        permission_class = self.ACTION_PERMISSIONS.get(self.action)
        return [permission_class()] if permission_class else super().get_permissions()

    def _export_format(self, request):
        export_format = request.query_params.get('export')
        if export_format and export_format not in ('xlsx', 'pdf'):
            raise ValidationError("export must be 'xlsx' or 'pdf'.")
        return export_format

    def _date(self, request, key, required=False):
        raw = request.query_params.get(key)
        if not raw:
            if required:
                raise ValidationError(f'{key} is a required query param (YYYY-MM-DD).')
            return None
        value = parse_date(raw)
        if not value:
            raise ValidationError(f'{key} must be an ISO date (YYYY-MM-DD).')
        return value

    @action(detail=False)
    def sales(self, request):
        data = reports.sales_report(
            project=request.query_params.get('project'),
            date_from=self._date(request, 'date_from'),
            date_to=self._date(request, 'date_to'),
            sale_type=request.query_params.get('sale_type'),
            status=request.query_params.get('status'),
            sold_by=request.query_params.get('sold_by'),
        )
        export_format = self._export_format(request)
        if export_format:
            return _export_response(
                export_format, 'sales-report', 'Sales Report', reports.SALES_COLUMNS, data['rows'],
                export.summary_lines(data['summary'], reports.SALES_SUMMARY_LABELS),
            )
        return Response(data)

    @action(detail=False)
    def installments(self, request):
        data = reports.installment_report(
            project=request.query_params.get('project'),
            status=request.query_params.get('status'),
            due_date_from=self._date(request, 'due_date_from'),
            due_date_to=self._date(request, 'due_date_to'),
        )
        export_format = self._export_format(request)
        if export_format:
            return _export_response(
                export_format, 'installment-report', 'Installment Report', reports.INSTALLMENT_COLUMNS,
                data['rows'], export.summary_lines(data['summary'], reports.INSTALLMENT_SUMMARY_LABELS),
            )
        return Response(data)

    @action(detail=False)
    def leads(self, request):
        data = reports.lead_report(
            project=request.query_params.get('project'),
            source=request.query_params.get('source'),
            status=request.query_params.get('status'),
            assigned_to=request.query_params.get('assigned_to'),
            date_from=self._date(request, 'date_from'),
            date_to=self._date(request, 'date_to'),
        )
        export_format = self._export_format(request)
        if export_format:
            return _export_response(
                export_format, 'lead-report', 'Lead Report', reports.LEAD_COLUMNS, data['rows'],
                export.summary_lines(data['summary'], reports.LEAD_SUMMARY_LABELS),
            )
        return Response(data)

    @action(detail=False, url_path='land-inventory')
    def land_inventory(self, request):
        data = reports.land_inventory_report(
            project=request.query_params.get('project'),
            status=request.query_params.get('status'),
        )
        export_format = self._export_format(request)
        if export_format:
            return _export_response(
                export_format, 'land-inventory-report', 'Land Inventory Report', reports.LAND_INVENTORY_COLUMNS,
                data['rows'], export.summary_lines(data['summary'], reports.LAND_INVENTORY_SUMMARY_LABELS),
            )
        return Response(data)

    @action(detail=False, url_path='cash-flow')
    def cash_flow(self, request):
        data = reports.cash_flow_report(
            date_from=self._date(request, 'date_from', required=True),
            date_to=self._date(request, 'date_to', required=True),
        )
        export_format = self._export_format(request)
        if export_format:
            return _export_response(
                export_format, 'cash-flow-report', 'Cash Flow Report', reports.CASH_FLOW_COLUMNS, data['rows'],
                export.summary_lines(data['summary'], reports.CASH_FLOW_SUMMARY_LABELS),
            )
        return Response(data)

    @action(detail=False)
    def dashboard(self, request):
        """One combined payload for the Dashboard page. Every section is
        gated on the same permission its own report/list endpoint requires;
        a section the user can't view comes back `null` rather than missing,
        so widgets can be hidden without a special-cased frontend contract."""
        return Response(dashboard.dashboard_summary(request.user))
