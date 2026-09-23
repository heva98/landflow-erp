from rest_framework.permissions import BasePermission

__all__ = ['HasInventoryPlotAccess', 'HasInventoryProjectAccess']


class _HasInventoryAccess(BasePermission):
    """Inventory has no model of its own — gate on the view permission of
    the underlying data it aggregates (mirrors apps.reports)."""

    required_perm = None

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.has_perm(self.required_perm),
        )


class HasInventoryPlotAccess(_HasInventoryAccess):
    required_perm = 'plots.view_plot'


class HasInventoryProjectAccess(_HasInventoryAccess):
    required_perm = 'projects.view_project'
