from rest_framework.routers import DefaultRouter

from .views import (
    AcquisitionAttachmentViewSet,
    LandAcquisitionViewSet,
    LandOwnerViewSet,
    NegotiationViewSet,
    PurchaseCostViewSet,
)

router = DefaultRouter()
router.register('land-acquisitions', LandAcquisitionViewSet, basename='landacquisition')
router.register('land-owners', LandOwnerViewSet, basename='landowner')
router.register('acquisition-negotiations', NegotiationViewSet, basename='negotiation')
router.register('acquisition-purchase-costs', PurchaseCostViewSet, basename='purchasecost')
router.register('acquisition-attachments', AcquisitionAttachmentViewSet, basename='acquisitionattachment')

urlpatterns = router.urls
