from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions
from apps.plots.models import Plot

from .filters import (
    BeaconFilter, RoadReserveFilter, SubdivisionFilter, SubdivisionPlotFilter, SurveyDocumentFilter, SurveyFilter,
    SurveyorFilter, UtilityReserveFilter,
)
from .models import (
    Beacon, RoadReserve, Subdivision, SubdivisionPlot, Survey, SurveyCompany, SurveyDocument, Surveyor,
    UtilityReserve,
)
from .permissions import CanManageSurveyWorkflow
from .serializers import (
    BeaconSerializer, RoadReserveSerializer, SubdivisionPlotSerializer, SubdivisionSerializer,
    SurveyCompanySerializer, SurveyDocumentSerializer, SurveySerializer, SurveyorSerializer,
    UtilityReserveSerializer,
)


class SurveyCompanyViewSet(viewsets.ModelViewSet):
    queryset = SurveyCompany.objects.all()
    serializer_class = SurveyCompanySerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'license_number']
    ordering_fields = ['name', 'created_at']


class SurveyorViewSet(viewsets.ModelViewSet):
    queryset = Surveyor.objects.select_related('company').all()
    serializer_class = SurveyorSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = SurveyorFilter
    search_fields = ['full_name', 'license_number']
    ordering_fields = ['full_name', 'created_at']


class SurveyViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.select_related(
        'project', 'company', 'lead_surveyor', 'approved_by', 'created_by',
    ).prefetch_related('beacons', 'documents').all()
    serializer_class = SurveySerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = SurveyFilter
    search_fields = ['reference_number', 'project__name']
    ordering_fields = ['created_at', 'scheduled_date', 'status']

    def get_permissions(self):
        if self.action in ('approve', 'reject'):
            return [IsAuthenticated(), CanManageSurveyWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        survey = self.get_object()
        if survey.status != Survey.Status.SCHEDULED:
            return Response(
                {'detail': 'Only a scheduled survey can be started.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        survey.status = Survey.Status.IN_PROGRESS
        survey.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(survey).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        survey = self.get_object()
        if survey.status != Survey.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Only a survey in progress can be completed.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        area = request.data.get('area_surveyed_sqm')
        if area is not None:
            survey.area_surveyed_sqm = area
        survey.completed_date = request.data.get('completed_date') or timezone.now().date()
        survey.status = Survey.Status.COMPLETED
        survey.save(update_fields=['status', 'area_surveyed_sqm', 'completed_date', 'updated_at'])
        return Response(self.get_serializer(survey).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        survey = self.get_object()
        if survey.status != Survey.Status.COMPLETED:
            return Response(
                {'detail': 'Only a completed survey can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        survey.status = Survey.Status.APPROVED
        survey.approved_by = request.user
        survey.approved_at = timezone.now()
        survey.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(survey).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        survey = self.get_object()
        if survey.status != Survey.Status.COMPLETED:
            return Response(
                {'detail': 'Only a completed survey can be rejected.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        survey.status = Survey.Status.REJECTED
        survey.rejection_reason = request.data.get('rejection_reason', '')
        survey.save(update_fields=['status', 'rejection_reason', 'updated_at'])
        return Response(self.get_serializer(survey).data)


class BeaconViewSet(viewsets.ModelViewSet):
    queryset = Beacon.objects.select_related('survey').all()
    serializer_class = BeaconSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = BeaconFilter
    ordering_fields = ['beacon_number', 'created_at']


class SurveyDocumentViewSet(viewsets.ModelViewSet):
    queryset = SurveyDocument.objects.select_related('survey', 'uploaded_by').all()
    serializer_class = SurveyDocumentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SurveyDocumentFilter
    ordering_fields = ['created_at']


class SubdivisionViewSet(viewsets.ModelViewSet):
    queryset = Subdivision.objects.select_related('survey', 'survey__project', 'approved_by').prefetch_related(
        'planned_plots', 'roads', 'utilities',
    ).all()
    serializer_class = SubdivisionSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SubdivisionFilter
    ordering_fields = ['created_at', 'status']

    def get_permissions(self):
        if self.action in ('approve', 'reject'):
            return [IsAuthenticated(), CanManageSurveyWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        subdivision = self.get_object()
        if subdivision.status != Subdivision.Status.DRAFT:
            return Response(
                {'detail': 'Only a draft subdivision can be submitted for approval.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        subdivision.status = Subdivision.Status.SUBMITTED
        subdivision.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(subdivision).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        subdivision = self.get_object()
        if subdivision.status != Subdivision.Status.SUBMITTED:
            return Response(
                {'detail': 'Only a submitted subdivision can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        subdivision.status = Subdivision.Status.APPROVED
        subdivision.approved_by = request.user
        subdivision.approved_at = timezone.now()
        subdivision.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(subdivision).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        subdivision = self.get_object()
        if subdivision.status != Subdivision.Status.SUBMITTED:
            return Response(
                {'detail': 'Only a submitted subdivision can be rejected.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        subdivision.status = Subdivision.Status.REJECTED
        subdivision.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(subdivision).data)


class SubdivisionPlotViewSet(viewsets.ModelViewSet):
    queryset = SubdivisionPlot.objects.select_related('subdivision', 'subdivision__survey__project', 'plot').all()
    serializer_class = SubdivisionPlotSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = SubdivisionPlotFilter
    ordering_fields = ['plot_number', 'created_at']

    def get_permissions(self):
        if self.action == 'convert_to_plot':
            # Gated entirely by the explicit plots.add_plot check below, not by
            # subdivisionplot model permissions — the person converting a
            # planned plot (typically whoever approved the subdivision) isn't
            # necessarily who drafted it.
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def convert_to_plot(self, request, pk=None):
        planned_plot = self.get_object()
        if planned_plot.subdivision.status != Subdivision.Status.APPROVED:
            return Response(
                {'detail': 'Only plots in an approved subdivision can be converted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if planned_plot.plot_id:
            return Response(
                {'detail': 'This subdivision plot has already been converted.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.user.has_perm('plots.add_plot'):
            return Response(
                {'detail': "You don't have permission to create plots."}, status=status.HTTP_403_FORBIDDEN,
            )

        project = planned_plot.subdivision.survey.project
        with transaction.atomic():
            plot = Plot.objects.create(
                project=project,
                plot_number=planned_plot.plot_number,
                block=planned_plot.block,
                street=planned_plot.street,
                area_sqm=planned_plot.area_sqm,
                latitude=planned_plot.latitude,
                longitude=planned_plot.longitude,
                corner_coordinates=planned_plot.corner_coordinates,
            )
            planned_plot.plot = plot
            planned_plot.save(update_fields=['plot', 'updated_at'])

        return Response(self.get_serializer(planned_plot).data, status=status.HTTP_201_CREATED)


class RoadReserveViewSet(viewsets.ModelViewSet):
    queryset = RoadReserve.objects.select_related('subdivision').all()
    serializer_class = RoadReserveSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = RoadReserveFilter
    ordering_fields = ['name', 'created_at']


class UtilityReserveViewSet(viewsets.ModelViewSet):
    queryset = UtilityReserve.objects.select_related('subdivision').all()
    serializer_class = UtilityReserveSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = UtilityReserveFilter
    ordering_fields = ['utility_type', 'created_at']
