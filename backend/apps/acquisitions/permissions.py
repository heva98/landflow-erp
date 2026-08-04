from rest_framework.permissions import BasePermission


class CanManageAcquisitionWorkflow(BasePermission):
    """Gates the approve/mark_purchased/cancel/spawn_project actions."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('acquisitions.approve_landacquisition'))
