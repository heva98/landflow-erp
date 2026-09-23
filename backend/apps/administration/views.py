from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import RoleBasedModelPermissions

from .filters import ActivityLogFilter, ApprovalStepFilter, ApprovalWorkflowFilter, CurrencyFilter, LocationFilter
from .models import ActivityLog, ApprovalStep, ApprovalWorkflow, Currency, Location, SystemSetting
from .serializers import (
    ActivityLogSerializer, ApprovalStepSerializer, ApprovalWorkflowSerializer, CurrencySerializer,
    LocationSerializer, SystemSettingSerializer,
)


class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CurrencyFilter
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'created_at']


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.select_related('parent').all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = LocationFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class SystemSettingView(RetrieveUpdateAPIView):
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]

    def get_object(self):
        return SystemSetting.load()


class ApprovalWorkflowViewSet(viewsets.ModelViewSet):
    queryset = ApprovalWorkflow.objects.prefetch_related('steps__role').all()
    serializer_class = ApprovalWorkflowSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ApprovalWorkflowFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class ApprovalStepViewSet(viewsets.ModelViewSet):
    queryset = ApprovalStep.objects.select_related('workflow', 'role').all()
    serializer_class = ApprovalStepSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ApprovalStepFilter
    ordering_fields = ['workflow', 'order']


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.select_related('actor').all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ActivityLogFilter
    ordering_fields = ['created_at']
