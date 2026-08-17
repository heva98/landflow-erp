from rest_framework.routers import DefaultRouter

from .views import (
    ContractViewSet, DocumentTemplateViewSet, OwnershipTransferViewSet, PowerOfAttorneyViewSet,
    SaleAgreementViewSet, TitleDeedViewSet, WitnessViewSet,
)

router = DefaultRouter()
router.register('sale-agreements', SaleAgreementViewSet, basename='saleagreement')
router.register('title-deeds', TitleDeedViewSet, basename='titledeed')
router.register('powers-of-attorney', PowerOfAttorneyViewSet, basename='powerofattorney')
router.register('legal-contracts', ContractViewSet, basename='legalcontract')
router.register('ownership-transfers', OwnershipTransferViewSet, basename='ownershiptransfer')
router.register('legal-witnesses', WitnessViewSet, basename='witness')
router.register('legal-document-templates', DocumentTemplateViewSet, basename='legaldocumenttemplate')

urlpatterns = router.urls
