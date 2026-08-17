from rest_framework.permissions import BasePermission


class CanManageCommissionPaymentWorkflow(BasePermission):
    """Gates the approve/mark_paid/cancel actions on CommissionPayment."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('agents.approve_commissionpayment'))
