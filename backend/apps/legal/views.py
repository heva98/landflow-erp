from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from apps.accounts.permissions import RoleBasedModelPermissions
from apps.notifications.models import Notification
from apps.notifications.services import send_notification
from apps.plots.models import Plot

from .filters import (
    ContractFilter, DocumentTemplateFilter, OwnershipTransferFilter, PowerOfAttorneyFilter, SaleAgreementFilter,
    TitleDeedFilter, WitnessFilter,
)
from .models import Contract, DocumentTemplate, OwnershipTransfer, PowerOfAttorney, SaleAgreement, TitleDeed, Witness
from .permissions import (
    CanManageOwnershipTransferWorkflow, CanManagePowerOfAttorneyWorkflow, CanManageSaleAgreementWorkflow,
    CanManageTitleDeedWorkflow,
)
from .serializers import (
    ContractSerializer, DocumentTemplateSerializer, OwnershipTransferSerializer, PowerOfAttorneySerializer,
    SaleAgreementSerializer, TitleDeedSerializer, WitnessSerializer,
)


class SaleAgreementViewSet(viewsets.ModelViewSet):
    queryset = SaleAgreement.objects.select_related(
        'sale', 'prepared_by', 'approved_by',
    ).prefetch_related('witnesses').all()
    serializer_class = SaleAgreementSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SaleAgreementFilter
    ordering_fields = ['created_at', 'status', 'signed_date']

    def get_permissions(self):
        if self.action in ('approve', 'void'):
            return [IsAuthenticated(), CanManageSaleAgreementWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def send_for_signature(self, request, pk=None):
        agreement = self.get_object()
        if agreement.status != SaleAgreement.Status.DRAFT:
            return Response(
                {'detail': 'Only a draft agreement can be sent for signature.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        agreement.status = SaleAgreement.Status.SENT_FOR_SIGNATURE
        agreement.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(agreement).data)

    @action(detail=True, methods=['post'])
    def mark_signed(self, request, pk=None):
        agreement = self.get_object()
        if agreement.status != SaleAgreement.Status.SENT_FOR_SIGNATURE:
            return Response(
                {'detail': 'Only an agreement sent for signature can be marked signed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        agreement.signed_date = request.data.get('signed_date') or timezone.now().date()
        agreement.status = SaleAgreement.Status.SIGNED
        agreement.save(update_fields=['status', 'signed_date', 'updated_at'])
        return Response(self.get_serializer(agreement).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        agreement = self.get_object()
        if agreement.status != SaleAgreement.Status.SIGNED:
            return Response(
                {'detail': 'Only a signed agreement can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        agreement.status = SaleAgreement.Status.APPROVED
        agreement.approved_by = request.user
        agreement.approved_at = timezone.now()
        agreement.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(agreement).data)

    @action(detail=True, methods=['post'])
    def void(self, request, pk=None):
        agreement = self.get_object()
        if agreement.status == SaleAgreement.Status.VOID:
            return Response({'detail': 'This agreement is already void.'}, status=status.HTTP_400_BAD_REQUEST)
        agreement.status = SaleAgreement.Status.VOID
        agreement.voided_at = timezone.now()
        agreement.void_reason = request.data.get('void_reason', '')
        agreement.save(update_fields=['status', 'voided_at', 'void_reason', 'updated_at'])
        return Response(self.get_serializer(agreement).data)


class TitleDeedViewSet(viewsets.ModelViewSet):
    queryset = TitleDeed.objects.select_related('sale', 'approved_by').all()
    serializer_class = TitleDeedSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = TitleDeedFilter
    ordering_fields = ['created_at', 'status', 'issued_date']

    def get_permissions(self):
        if self.action == 'approve':
            return [IsAuthenticated(), CanManageTitleDeedWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        deed = self.get_object()
        if deed.status != TitleDeed.Status.PENDING:
            return Response(
                {'detail': 'Only a pending title deed can be applied for.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        deed.registry_office = request.data.get('registry_office', deed.registry_office)
        deed.applied_date = request.data.get('applied_date') or timezone.now().date()
        deed.status = TitleDeed.Status.APPLIED
        deed.save(update_fields=['status', 'registry_office', 'applied_date', 'updated_at'])
        return Response(self.get_serializer(deed).data)

    @action(detail=True, methods=['post'])
    def mark_issued(self, request, pk=None):
        deed = self.get_object()
        if deed.status != TitleDeed.Status.APPLIED:
            return Response(
                {'detail': 'Only an applied title deed can be marked issued.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        deed_number = request.data.get('deed_number')
        if not deed_number:
            return Response({'deed_number': 'A deed number is required.'}, status=status.HTTP_400_BAD_REQUEST)
        deed.deed_number = deed_number
        deed.issued_date = request.data.get('issued_date') or timezone.now().date()
        deed.status = TitleDeed.Status.ISSUED
        deed.save(update_fields=['status', 'deed_number', 'issued_date', 'updated_at'])
        return Response(self.get_serializer(deed).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        deed = self.get_object()
        if deed.status != TitleDeed.Status.ISSUED:
            return Response(
                {'detail': 'Only an issued title deed can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        deed.status = TitleDeed.Status.APPROVED
        deed.approved_by = request.user
        deed.approved_at = timezone.now()
        deed.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(deed).data)


class PowerOfAttorneyViewSet(viewsets.ModelViewSet):
    queryset = PowerOfAttorney.objects.select_related('sale', 'approved_by').prefetch_related('witnesses').all()
    serializer_class = PowerOfAttorneySerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PowerOfAttorneyFilter
    search_fields = ['poa_number', 'grantor_name', 'grantee_name']
    ordering_fields = ['created_at', 'status', 'expiry_date']

    def get_permissions(self):
        if self.action in ('approve', 'revoke'):
            return [IsAuthenticated(), CanManagePowerOfAttorneyWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        poa = self.get_object()
        if poa.status != PowerOfAttorney.Status.PENDING:
            return Response(
                {'detail': 'Only a pending power of attorney can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        poa.status = PowerOfAttorney.Status.ACTIVE
        poa.approved_by = request.user
        poa.approved_at = timezone.now()
        if not poa.granted_date:
            poa.granted_date = timezone.now().date()
        poa.save(update_fields=['status', 'approved_by', 'approved_at', 'granted_date', 'updated_at'])
        return Response(self.get_serializer(poa).data)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        poa = self.get_object()
        if poa.status != PowerOfAttorney.Status.ACTIVE:
            return Response(
                {'detail': 'Only an active power of attorney can be revoked.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        poa.status = PowerOfAttorney.Status.REVOKED
        poa.revoked_at = timezone.now()
        poa.revocation_reason = request.data.get('revocation_reason', '')
        poa.save(update_fields=['status', 'revoked_at', 'revocation_reason', 'updated_at'])
        return Response(self.get_serializer(poa).data)

    @action(detail=True, methods=['post'])
    def expire(self, request, pk=None):
        poa = self.get_object()
        if poa.status != PowerOfAttorney.Status.ACTIVE:
            return Response(
                {'detail': 'Only an active power of attorney can be expired.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        poa.status = PowerOfAttorney.Status.EXPIRED
        poa.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(poa).data)


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.select_related('content_type', 'created_by').prefetch_related('witnesses').all()
    serializer_class = ContractSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ContractFilter
    search_fields = ['contract_number', 'title', 'counterparty_name']
    ordering_fields = ['created_at', 'status', 'start_date', 'end_date']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        contract = self.get_object()
        if contract.status != Contract.Status.DRAFT:
            return Response(
                {'detail': 'Only a draft contract can be activated.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        contract.status = Contract.Status.ACTIVE
        contract.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(contract).data)

    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        contract = self.get_object()
        if contract.status != Contract.Status.ACTIVE:
            return Response(
                {'detail': 'Only an active contract can be terminated.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        contract.status = Contract.Status.TERMINATED
        contract.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(contract).data)


class OwnershipTransferViewSet(viewsets.ModelViewSet):
    queryset = OwnershipTransfer.objects.select_related(
        'sale', 'sale__plot', 'sale__plot__project', 'sale__customer', 'requested_by', 'approved_by',
    ).prefetch_related('witnesses').all()
    serializer_class = OwnershipTransferSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = OwnershipTransferFilter
    ordering_fields = ['created_at', 'status', 'completed_at']

    def get_permissions(self):
        if self.action in ('approve', 'reject', 'complete'):
            return [IsAuthenticated(), CanManageOwnershipTransferWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != OwnershipTransfer.Status.PENDING:
            return Response(
                {'detail': 'Only a pending ownership transfer can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        transfer.status = OwnershipTransfer.Status.APPROVED
        transfer.approved_by = request.user
        transfer.approved_at = timezone.now()
        transfer.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(transfer).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status not in (OwnershipTransfer.Status.PENDING, OwnershipTransfer.Status.APPROVED):
            return Response(
                {'detail': 'Only a pending or approved ownership transfer can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        transfer.status = OwnershipTransfer.Status.REJECTED
        transfer.rejection_reason = request.data.get('rejection_reason', '')
        transfer.save(update_fields=['status', 'rejection_reason', 'updated_at'])
        return Response(self.get_serializer(transfer).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != OwnershipTransfer.Status.APPROVED:
            return Response(
                {'detail': 'Only an approved ownership transfer can be completed.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        transfer.status = OwnershipTransfer.Status.COMPLETED
        transfer.completed_at = timezone.now()
        transfer.save(update_fields=['status', 'completed_at', 'updated_at'])

        sale = transfer.sale
        Plot.objects.filter(pk=sale.plot_id).update(status=Plot.Status.TRANSFERRED)

        legal_staff_emails = list(
            User.objects.filter(role__name='Legal Officer', is_active=True)
            .exclude(email='').values_list('email', flat=True)
        )
        if legal_staff_emails:
            send_notification(
                notification_type=Notification.Type.OWNERSHIP_TRANSFER_COMPLETED,
                content_object=transfer,
                recipient_email=legal_staff_emails,
                context={
                    'transfer_number': transfer.transfer_number,
                    'sale_number': sale.sale_number,
                    'plot_number': sale.plot.plot_number,
                    'project_name': sale.plot.project.name,
                    'customer_name': sale.customer.full_name,
                    'completed_by': request.user.get_full_name(),
                },
            )

        return Response(self.get_serializer(transfer).data)


class WitnessViewSet(viewsets.ModelViewSet):
    queryset = Witness.objects.select_related('content_type').all()
    serializer_class = WitnessSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = WitnessFilter
    ordering_fields = ['full_name', 'created_at']


class DocumentTemplateViewSet(viewsets.ModelViewSet):
    queryset = DocumentTemplate.objects.select_related('created_by').all()
    serializer_class = DocumentTemplateSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DocumentTemplateFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
