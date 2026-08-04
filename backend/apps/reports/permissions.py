from rest_framework.permissions import BasePermission

from apps.finance.permissions import HasFinanceReportAccess

__all__ = [
    'HasSalesReportAccess', 'HasInstallmentReportAccess', 'HasLeadReportAccess',
    'HasLandInventoryReportAccess', 'HasFinanceReportAccess',
]


class _HasReportAccess(BasePermission):
    """Reports have no model of their own — gate on the view permission of
    the underlying data they aggregate, same permission a user would already
    need to browse that data directly."""

    required_perm = None

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.has_perm(self.required_perm),
        )


class HasSalesReportAccess(_HasReportAccess):
    required_perm = 'sales.view_sale'


class HasInstallmentReportAccess(_HasReportAccess):
    required_perm = 'installments.view_installment'


class HasLeadReportAccess(_HasReportAccess):
    required_perm = 'crm.view_lead'


class HasLandInventoryReportAccess(_HasReportAccess):
    required_perm = 'plots.view_plot'
