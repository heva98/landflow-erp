from rest_framework import serializers

from .models import Attendance, Department, Employee, LeaveRequest, LeaveType, PayrollRecord, PerformanceReview


class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.full_name', read_only=True, default=None)
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'description', 'manager', 'manager_name', 'employee_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True, default=None)

    class Meta:
        model = Employee
        fields = [
            'id', 'employee_number', 'user', 'full_name', 'job_title', 'department', 'department_name',
            'manager', 'manager_name', 'employment_type', 'status',
            'phone', 'email', 'national_id', 'address', 'date_of_birth',
            'hire_date', 'termination_date',
            'basic_salary', 'bank_name', 'bank_account_number',
            'emergency_contact_name', 'emergency_contact_phone', 'notes',
            'created_at', 'updated_at',
        ]
        # Status transitions (activate/put_on_leave/suspend/terminate) happen
        # only through the dedicated actions, never by editing this field directly.
        read_only_fields = ['id', 'employee_number', 'status', 'termination_date', 'created_at', 'updated_at']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'date', 'status', 'check_in', 'check_out', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name', 'default_days_per_year', 'is_paid', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)
    requested_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'reason', 'requested_days', 'status',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'created_at', 'updated_at',
        ]
        # Status transitions (approve/reject/cancel) happen only through the
        # dedicated actions, never by editing this field directly.
        read_only_fields = [
            'id', 'status', 'approved_by', 'approved_at', 'rejection_reason', 'created_at', 'updated_at',
        ]


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True, default=None)

    class Meta:
        model = PerformanceReview
        fields = [
            'id', 'employee', 'employee_name', 'review_period_start', 'review_period_end',
            'reviewer', 'reviewer_name', 'rating', 'strengths', 'areas_for_improvement', 'goals',
            'reviewed_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'reviewer', 'reviewed_at', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class PayrollRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    net_pay = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = PayrollRecord
        fields = [
            'id', 'employee', 'employee_name', 'pay_period_start', 'pay_period_end', 'status',
            'basic_salary', 'allowances', 'commission_amount', 'deductions', 'net_pay',
            'processed_at', 'paid_at', 'notes', 'created_at', 'updated_at',
        ]
        # Status transitions (process/mark_paid) happen only through the
        # dedicated actions, never by editing this field directly.
        read_only_fields = ['id', 'status', 'processed_at', 'paid_at', 'created_at', 'updated_at']
