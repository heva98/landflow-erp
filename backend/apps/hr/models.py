import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel


def _generate_employee_number():
    return f'EMP-{timezone.now():%Y%m}-{uuid.uuid4().hex[:8].upper()}'


class Department(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    # String reference — Employee is defined below and itself points back at
    # Department, so neither can import the other first.
    manager = models.ForeignKey(
        'Employee', null=True, blank=True, on_delete=models.SET_NULL, related_name='departments_managed',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Employee(BaseModel):
    class EmploymentType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full Time'
        PART_TIME = 'part_time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        INTERN = 'intern', 'Intern'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        ON_LEAVE = 'on_leave', 'On Leave'
        SUSPENDED = 'suspended', 'Suspended'
        TERMINATED = 'terminated', 'Terminated'

    employee_number = models.CharField(max_length=30, unique=True, editable=False, blank=True)
    # Optional login account — not every employee needs system access (e.g. a
    # driver or laborer), but anyone who does (agents, managers, ...) links
    # here instead of Employee duplicating User's identity/auth fields.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='employee_profile',
    )

    full_name = models.CharField(max_length=255)
    job_title = models.CharField(max_length=255, blank=True)
    department = models.ForeignKey(
        Department, null=True, blank=True, on_delete=models.SET_NULL, related_name='employees',
    )
    manager = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='direct_reports',
    )

    employment_type = models.CharField(
        max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME,
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    national_id = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=255, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    hire_date = models.DateField(default=timezone.localdate)
    termination_date = models.DateField(null=True, blank=True)

    # Payroll — TZS
    basic_salary = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    bank_name = models.CharField(max_length=255, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)

    emergency_contact_name = models.CharField(max_length=255, blank=True)
    emergency_contact_phone = models.CharField(max_length=30, blank=True)

    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return f'{self.employee_number} - {self.full_name}'

    def save(self, *args, **kwargs):
        if not self.employee_number:
            self.employee_number = _generate_employee_number()
        super().save(*args, **kwargs)


class Attendance(BaseModel):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Present'
        ABSENT = 'absent', 'Absent'
        LATE = 'late', 'Late'
        HALF_DAY = 'half_day', 'Half Day'
        ON_LEAVE = 'on_leave', 'On Leave'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date']
        constraints = [
            models.UniqueConstraint(fields=['employee', 'date'], name='unique_attendance_per_employee_per_day'),
        ]

    def __str__(self):
        return f'{self.employee.full_name} - {self.date} ({self.get_status_display()})'


class LeaveType(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    default_days_per_year = models.PositiveIntegerField(default=0)
    is_paid = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class LeaveRequest(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='leave_requests_approved',
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']
        permissions = [
            ('approve_leaverequest', 'Can approve or reject a leave request'),
        ]

    def __str__(self):
        return f'{self.employee.full_name} - {self.leave_type} ({self.start_date} to {self.end_date})'

    @property
    def requested_days(self):
        return (self.end_date - self.start_date).days + 1


class PerformanceReview(BaseModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='performance_reviews_given',
    )
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-reviewed_at']

    def __str__(self):
        return f'Review for {self.employee.full_name} ({self.rating}/5)'


class PayrollRecord(BaseModel):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PROCESSED = 'processed', 'Processed'
        PAID = 'paid', 'Paid'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_records')
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    basic_salary = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    # Filled in from the agents app's paid CommissionPayment records for this
    # period when payroll is processed — a plain field, not a live FK sum,
    # so a payslip stays fixed once issued even if commissions change later.
    commission_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    processed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-pay_period_start']
        constraints = [
            models.UniqueConstraint(
                fields=['employee', 'pay_period_start', 'pay_period_end'],
                name='unique_payroll_per_employee_per_period',
            ),
        ]

    def __str__(self):
        return f'Payroll for {self.employee.full_name} ({self.pay_period_start} to {self.pay_period_end})'

    @property
    def net_pay(self):
        return self.basic_salary + self.allowances + self.commission_amount - self.deductions
