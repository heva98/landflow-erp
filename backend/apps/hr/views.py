from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import RoleBasedModelPermissions

from .filters import (
    AttendanceFilter, DepartmentFilter, EmployeeFilter, LeaveRequestFilter, LeaveTypeFilter, PayrollRecordFilter,
    PerformanceReviewFilter,
)
from .models import Attendance, Department, Employee, LeaveRequest, LeaveType, PayrollRecord, PerformanceReview
from .permissions import CanManageLeaveRequestWorkflow
from .serializers import (
    AttendanceSerializer, DepartmentSerializer, EmployeeSerializer, LeaveRequestSerializer, LeaveTypeSerializer,
    PayrollRecordSerializer, PerformanceReviewSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.select_related('manager').all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DepartmentFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department', 'manager', 'user').all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = EmployeeFilter
    search_fields = ['employee_number', 'full_name', 'email', 'phone', 'national_id']
    ordering_fields = ['full_name', 'hire_date', 'created_at']

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        employee = self.get_object()
        if employee.status == Employee.Status.ACTIVE:
            return Response({'detail': 'This employee is already active.'}, status=status.HTTP_400_BAD_REQUEST)
        employee.status = Employee.Status.ACTIVE
        employee.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(employee).data)

    @action(detail=True, methods=['post'])
    def put_on_leave(self, request, pk=None):
        employee = self.get_object()
        if employee.status != Employee.Status.ACTIVE:
            return Response(
                {'detail': 'Only an active employee can be put on leave.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        employee.status = Employee.Status.ON_LEAVE
        employee.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(employee).data)

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        employee = self.get_object()
        if employee.status == Employee.Status.TERMINATED:
            return Response(
                {'detail': 'A terminated employee cannot be suspended.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        employee.status = Employee.Status.SUSPENDED
        employee.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(employee).data)

    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        employee = self.get_object()
        if employee.status == Employee.Status.TERMINATED:
            return Response({'detail': 'This employee is already terminated.'}, status=status.HTTP_400_BAD_REQUEST)
        employee.status = Employee.Status.TERMINATED
        employee.termination_date = request.data.get('termination_date') or timezone.localdate()
        employee.save(update_fields=['status', 'termination_date', 'updated_at'])
        return Response(self.get_serializer(employee).data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = AttendanceFilter
    ordering_fields = ['date', 'created_at']


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = LeaveTypeFilter
    search_fields = ['name']
    ordering_fields = ['name']


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee', 'leave_type', 'approved_by').all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = LeaveRequestFilter
    ordering_fields = ['start_date', 'created_at', 'status']

    def get_permissions(self):
        if self.action in ('approve', 'reject'):
            return [IsAuthenticated(), CanManageLeaveRequestWorkflow()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != LeaveRequest.Status.PENDING:
            return Response(
                {'detail': 'Only a pending leave request can be approved.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        leave_request.status = LeaveRequest.Status.APPROVED
        leave_request.approved_by = request.user
        leave_request.approved_at = timezone.now()
        leave_request.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(leave_request).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != LeaveRequest.Status.PENDING:
            return Response(
                {'detail': 'Only a pending leave request can be rejected.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        leave_request.status = LeaveRequest.Status.REJECTED
        leave_request.approved_by = request.user
        leave_request.approved_at = timezone.now()
        leave_request.rejection_reason = request.data.get('rejection_reason', '')
        leave_request.save(
            update_fields=['status', 'approved_by', 'approved_at', 'rejection_reason', 'updated_at'],
        )
        return Response(self.get_serializer(leave_request).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        leave_request = self.get_object()
        if leave_request.status != LeaveRequest.Status.PENDING:
            return Response(
                {'detail': 'Only a pending leave request can be cancelled.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        leave_request.status = LeaveRequest.Status.CANCELLED
        leave_request.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(leave_request).data)


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.select_related('employee', 'reviewer').all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PerformanceReviewFilter
    ordering_fields = ['reviewed_at', 'rating']


class PayrollRecordViewSet(viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.select_related('employee').all()
    serializer_class = PayrollRecordSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PayrollRecordFilter
    ordering_fields = ['pay_period_start', 'created_at']

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        record = self.get_object()
        if record.status != PayrollRecord.Status.DRAFT:
            return Response(
                {'detail': 'Only a draft payroll record can be processed.'}, status=status.HTTP_400_BAD_REQUEST,
            )
        record.status = PayrollRecord.Status.PROCESSED
        record.processed_at = timezone.now()
        record.save(update_fields=['status', 'processed_at', 'updated_at'])
        return Response(self.get_serializer(record).data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        record = self.get_object()
        if record.status != PayrollRecord.Status.PROCESSED:
            return Response(
                {'detail': 'Only a processed payroll record can be marked paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        record.status = PayrollRecord.Status.PAID
        record.paid_at = timezone.now()
        record.save(update_fields=['status', 'paid_at', 'updated_at'])
        return Response(self.get_serializer(record).data)
