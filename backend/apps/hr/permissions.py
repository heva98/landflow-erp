from rest_framework.permissions import BasePermission


class CanManageLeaveRequestWorkflow(BasePermission):
    """Gates the approve/reject actions on LeaveRequest."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('hr.approve_leaverequest'))
