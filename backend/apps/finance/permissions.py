from rest_framework.permissions import BasePermission


class HasFinanceReportAccess(BasePermission):
    """P&L and cash-flow reports aren't tied to a single model, so
    RoleBasedModelPermissions (which needs a queryset to derive app_label/
    model_name from) doesn't apply — gate on the same view permission as the
    general ledger instead."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.has_perm('finance.view_journalline'))
