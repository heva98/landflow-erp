from django.contrib import admin

from .models import Attendance, Department, Employee, LeaveRequest, LeaveType, PayrollRecord, PerformanceReview


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'manager')
    search_fields = ('name',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_number', 'full_name', 'job_title', 'department', 'status', 'hire_date')
    list_filter = ('status', 'employment_type', 'department')
    search_fields = ('employee_number', 'full_name', 'national_id')


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status', 'check_in', 'check_out')
    list_filter = ('status', 'date')
    search_fields = ('employee__full_name',)


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'default_days_per_year', 'is_paid')


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__full_name',)


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ('employee', 'review_period_start', 'review_period_end', 'rating', 'reviewer')
    list_filter = ('rating',)
    search_fields = ('employee__full_name',)


@admin.register(PayrollRecord)
class PayrollRecordAdmin(admin.ModelAdmin):
    list_display = ('employee', 'pay_period_start', 'pay_period_end', 'status', 'net_pay')
    list_filter = ('status',)
    search_fields = ('employee__full_name',)
