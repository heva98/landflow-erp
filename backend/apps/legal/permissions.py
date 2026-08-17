from rest_framework.permissions import BasePermission


class CanManageSaleAgreementWorkflow(BasePermission):
    """Gates the approve/void actions on SaleAgreement."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('legal.approve_saleagreement'))


class CanManageTitleDeedWorkflow(BasePermission):
    """Gates the approve action on TitleDeed."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('legal.approve_titledeed'))


class CanManagePowerOfAttorneyWorkflow(BasePermission):
    """Gates the approve/revoke actions on PowerOfAttorney."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('legal.approve_powerofattorney'))


class CanManageOwnershipTransferWorkflow(BasePermission):
    """Gates the approve/reject/complete actions on OwnershipTransfer."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.has_perm('legal.approve_ownershiptransfer'))
