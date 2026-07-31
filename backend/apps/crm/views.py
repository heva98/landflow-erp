from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions

from .filters import CommunicationLogFilter, CustomerFilter, LeadFilter, NoteFilter
from .models import CommunicationLog, Customer, Lead, Note, Organization
from .serializers import (
    CommunicationLogSerializer,
    CustomerSerializer,
    LeadSerializer,
    NoteSerializer,
    OrganizationSerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'registration_number', 'tin', 'email', 'phone']
    ordering_fields = ['name', 'created_at']


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.select_related('organization').all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CustomerFilter
    search_fields = ['full_name', 'phone', 'email']
    ordering_fields = ['full_name', 'created_at']


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.select_related('organization', 'interested_project', 'referred_by', 'assigned_to').all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = LeadFilter
    search_fields = ['full_name', 'phone', 'email']
    ordering_fields = ['full_name', 'created_at', 'status']

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        lead = self.get_object()
        if lead.converted_customer_id:
            return Response({'detail': 'Lead has already been converted.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            customer = Customer.objects.create(
                customer_type=(
                    Customer.CustomerType.ORGANIZATION if lead.organization_id
                    else Customer.CustomerType.INDIVIDUAL
                ),
                full_name=lead.full_name,
                organization=lead.organization,
                phone=lead.phone,
                email=lead.email,
            )
            lead.converted_customer = customer
            lead.status = Lead.Status.PURCHASED
            lead.save(update_fields=['converted_customer', 'status', 'updated_at'])

        return Response(self.get_serializer(lead).data)


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.select_related('content_type', 'author').all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = NoteFilter
    ordering_fields = ['created_at']


class CommunicationLogViewSet(viewsets.ModelViewSet):
    queryset = CommunicationLog.objects.select_related('content_type', 'logged_by').all()
    serializer_class = CommunicationLogSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = CommunicationLogFilter
    ordering_fields = ['occurred_at']
