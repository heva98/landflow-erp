from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityLogViewSet, ApprovalStepViewSet, ApprovalWorkflowViewSet, CurrencyViewSet, LocationViewSet,
    SystemSettingView,
)

router = DefaultRouter()
router.register('currencies', CurrencyViewSet, basename='currency')
router.register('locations', LocationViewSet, basename='location')
router.register('approval-workflows', ApprovalWorkflowViewSet, basename='approvalworkflow')
router.register('approval-steps', ApprovalStepViewSet, basename='approvalstep')
router.register('activity-logs', ActivityLogViewSet, basename='activitylog')

urlpatterns = [
    path('settings/', SystemSettingView.as_view(), name='system-settings'),
] + router.urls
