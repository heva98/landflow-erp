from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions
from apps.projects.models import Project

from .filters import AcquisitionAttachmentFilter, LandOwnerFilter, NegotiationFilter, PurchaseCostFilter
from .models import AcquisitionAttachment, LandAcquisition, LandOwner, Negotiation, PurchaseCost
from .permissions import CanManageAcquisitionWorkflow
from .serializers import (
    AcquisitionAttachmentSerializer,
    LandAcquisitionSerializer,
    LandOwnerSerializer,
    NegotiationSerializer,
    PurchaseCostSerializer,
)


class LandAcquisitionViewSet(viewsets.ModelViewSet):
    queryset = LandAcquisition.objects.select_related('approved_by', 'created_by', 'project').prefetch_related(
        'owners', 'negotiations', 'purchase_costs', 'attachments',
    ).all()
    serializer_class = LandAcquisitionSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['reference_number', 'name', 'location']
    ordering_fields = ['created_at', 'name', 'area_sqm', 'purchase_price', 'status']

    def get_permissions(self):
        if self.action in ('approve', 'mark_purchased', 'cancel', 'spawn_project'):
            return [IsAuthenticated(), CanManageAcquisitionWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        acquisition = self.get_object()
        if acquisition.status not in (LandAcquisition.Status.POTENTIAL, LandAcquisition.Status.NEGOTIATING):
            return Response(
                {'detail': 'Only a potential or negotiating acquisition can be approved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        acquisition.status = LandAcquisition.Status.APPROVED
        acquisition.approved_by = request.user
        acquisition.approved_at = timezone.now()
        acquisition.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(acquisition).data)

    @action(detail=True, methods=['post'])
    def mark_purchased(self, request, pk=None):
        acquisition = self.get_object()
        if acquisition.status != LandAcquisition.Status.APPROVED:
            return Response(
                {'detail': 'Only an approved acquisition can be marked purchased.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        purchase_price = request.data.get('purchase_price', acquisition.purchase_price)
        if not purchase_price or float(purchase_price) <= 0:
            return Response(
                {'purchase_price': 'A purchase price greater than zero is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        acquisition.purchase_price = purchase_price
        acquisition.purchased_at = request.data.get('purchased_at') or timezone.now().date()
        acquisition.status = LandAcquisition.Status.PURCHASED
        acquisition.save(update_fields=['status', 'purchase_price', 'purchased_at', 'updated_at'])
        return Response(self.get_serializer(acquisition).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        acquisition = self.get_object()
        if acquisition.status in (LandAcquisition.Status.PURCHASED, LandAcquisition.Status.CANCELLED):
            return Response(
                {'detail': 'A purchased or already-cancelled acquisition cannot be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        acquisition.status = LandAcquisition.Status.CANCELLED
        acquisition.cancelled_at = timezone.now()
        acquisition.cancellation_reason = request.data.get('cancellation_reason', '')
        acquisition.save(update_fields=['status', 'cancelled_at', 'cancellation_reason', 'updated_at'])
        return Response(self.get_serializer(acquisition).data)

    @action(detail=True, methods=['post'])
    def spawn_project(self, request, pk=None):
        acquisition = self.get_object()
        if acquisition.status not in (LandAcquisition.Status.APPROVED, LandAcquisition.Status.PURCHASED):
            return Response(
                {'detail': 'Only an approved or purchased acquisition can spawn a project.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if acquisition.project_id:
            return Response({'detail': 'This acquisition has already spawned a project.'}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.has_perm('projects.add_project'):
            return Response(
                {'detail': "You don't have permission to create projects."}, status=status.HTTP_403_FORBIDDEN,
            )

        with transaction.atomic():
            project = Project.objects.create(
                name=acquisition.name,
                location=acquisition.location,
                latitude=acquisition.latitude,
                longitude=acquisition.longitude,
                total_area_sqm=acquisition.area_sqm,
                acquisition_cost=acquisition.total_purchase_cost,
                start_date=timezone.now().date(),
            )
            acquisition.project = project
            acquisition.save(update_fields=['project', 'updated_at'])

        return Response(self.get_serializer(acquisition).data, status=status.HTTP_201_CREATED)


class LandOwnerViewSet(viewsets.ModelViewSet):
    queryset = LandOwner.objects.select_related('acquisition').all()
    serializer_class = LandOwnerSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = LandOwnerFilter
    ordering_fields = ['full_name', 'created_at']


class NegotiationViewSet(viewsets.ModelViewSet):
    queryset = Negotiation.objects.select_related('acquisition', 'negotiated_by').all()
    serializer_class = NegotiationSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = NegotiationFilter
    ordering_fields = ['negotiated_on', 'created_at']


class PurchaseCostViewSet(viewsets.ModelViewSet):
    queryset = PurchaseCost.objects.select_related('acquisition').all()
    serializer_class = PurchaseCostSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PurchaseCostFilter
    ordering_fields = ['incurred_on', 'created_at', 'amount']


class AcquisitionAttachmentViewSet(viewsets.ModelViewSet):
    queryset = AcquisitionAttachment.objects.select_related('acquisition', 'uploaded_by').all()
    serializer_class = AcquisitionAttachmentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AcquisitionAttachmentFilter
    ordering_fields = ['created_at']
