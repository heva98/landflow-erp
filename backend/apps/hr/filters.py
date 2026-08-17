import django_filters

from .models import Attendance, Department, Employee, LeaveRequest, LeaveType, PayrollRecord, PerformanceReview


class DepartmentFilter(django_filters.FilterSet):
    class Meta:
        model = Department
        fields = ['manager']


class EmployeeFilter(django_filters.FilterSet):
    class Meta:
        model = Employee
        fields = ['department', 'manager', 'status', 'employment_type']


class AttendanceFilter(django_filters.FilterSet):
    class Meta:
        model = Attendance
        fields = ['employee', 'date', 'status']


class LeaveTypeFilter(django_filters.FilterSet):
    class Meta:
        model = LeaveType
        fields = ['is_paid']


class LeaveRequestFilter(django_filters.FilterSet):
    class Meta:
        model = LeaveRequest
        fields = ['employee', 'leave_type', 'status']


class PerformanceReviewFilter(django_filters.FilterSet):
    class Meta:
        model = PerformanceReview
        fields = ['employee', 'reviewer']


class PayrollRecordFilter(django_filters.FilterSet):
    class Meta:
        model = PayrollRecord
        fields = ['employee', 'status']
