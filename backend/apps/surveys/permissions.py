from rest_framework.permissions import BasePermission


class CanManageSurveyWorkflow(BasePermission):
    """Gates the approve/reject actions on Survey and Subdivision (shared 'approve_survey' permission)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('surveys.approve_survey'))
