from rest_framework.routers import DefaultRouter

from .views import (
    AgentViewSet, CommissionPaymentViewSet, CommissionPlanViewSet, CommissionTierViewSet, SalesTargetViewSet,
    TerritoryViewSet,
)

router = DefaultRouter()
router.register('territories', TerritoryViewSet, basename='territory')
router.register('commission-plans', CommissionPlanViewSet, basename='commissionplan')
router.register('commission-tiers', CommissionTierViewSet, basename='commissiontier')
router.register('agents', AgentViewSet, basename='agent')
router.register('sales-targets', SalesTargetViewSet, basename='salestarget')
router.register('commission-payments', CommissionPaymentViewSet, basename='commissionpayment')

urlpatterns = router.urls
