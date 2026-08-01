from rest_framework.routers import DefaultRouter

from .views import InstallmentPaymentViewSet, InstallmentViewSet, PaymentPlanViewSet

router = DefaultRouter()
router.register('payment-plans', PaymentPlanViewSet, basename='paymentplan')
router.register('installments', InstallmentViewSet, basename='installment')
router.register('installment-payments', InstallmentPaymentViewSet, basename='installmentpayment')

urlpatterns = router.urls
