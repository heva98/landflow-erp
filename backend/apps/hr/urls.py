from rest_framework.routers import DefaultRouter

from .views import (
    AttendanceViewSet, DepartmentViewSet, EmployeeViewSet, LeaveRequestViewSet, LeaveTypeViewSet,
    PayrollRecordViewSet, PerformanceReviewViewSet,
)

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('employees', EmployeeViewSet, basename='employee')
router.register('attendance', AttendanceViewSet, basename='attendance')
router.register('leave-types', LeaveTypeViewSet, basename='leavetype')
router.register('leave-requests', LeaveRequestViewSet, basename='leaverequest')
router.register('performance-reviews', PerformanceReviewViewSet, basename='performancereview')
router.register('payroll-records', PayrollRecordViewSet, basename='payrollrecord')

urlpatterns = router.urls
