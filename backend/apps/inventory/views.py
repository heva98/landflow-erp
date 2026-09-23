from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.plots.models import Plot

from . import inventory
from .permissions import HasInventoryPlotAccess, HasInventoryProjectAccess


class InventoryViewSet(viewsets.ViewSet):
    """Read-only aggregation views over existing Plot/Project data
    (spec Module 16). One action per named view from the spec, plus a
    combined `overview` action for the page's KPI row."""

    ACTION_PERMISSIONS = {
        'unsold': HasInventoryPlotAccess,
        'reserved': HasInventoryPlotAccess,
        'transferred': HasInventoryPlotAccess,
        'available_area': HasInventoryPlotAccess,
        'future_projects': HasInventoryProjectAccess,
        'overview': HasInventoryPlotAccess,
    }

    def get_permissions(self):
        permission_class = self.ACTION_PERMISSIONS.get(self.action)
        return [permission_class()] if permission_class else super().get_permissions()

    @action(detail=False)
    def unsold(self, request):
        data = inventory.plots_by_status_report(Plot.Status.AVAILABLE, project=request.query_params.get('project'))
        return Response(data)

    @action(detail=False)
    def reserved(self, request):
        data = inventory.plots_by_status_report(Plot.Status.RESERVED, project=request.query_params.get('project'))
        return Response(data)

    @action(detail=False)
    def transferred(self, request):
        data = inventory.plots_by_status_report(Plot.Status.TRANSFERRED, project=request.query_params.get('project'))
        return Response(data)

    @action(detail=False, url_path='available-area')
    def available_area(self, request):
        data = inventory.available_area_report(project=request.query_params.get('project'))
        return Response(data)

    @action(detail=False, url_path='future-projects')
    def future_projects(self, request):
        data = inventory.future_projects_report()
        return Response(data)

    @action(detail=False)
    def overview(self, request):
        return Response(inventory.overview_summary())
