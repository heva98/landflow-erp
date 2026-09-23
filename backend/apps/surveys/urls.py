from rest_framework.routers import DefaultRouter

from .views import (
    BeaconViewSet, RoadReserveViewSet, SubdivisionPlotViewSet, SubdivisionViewSet, SurveyCompanyViewSet,
    SurveyDocumentViewSet, SurveyViewSet, SurveyorViewSet, UtilityReserveViewSet,
)

router = DefaultRouter()
router.register('survey-companies', SurveyCompanyViewSet, basename='surveycompany')
router.register('surveyors', SurveyorViewSet, basename='surveyor')
router.register('surveys', SurveyViewSet, basename='survey')
router.register('survey-beacons', BeaconViewSet, basename='beacon')
router.register('survey-documents', SurveyDocumentViewSet, basename='surveydocument')
router.register('subdivisions', SubdivisionViewSet, basename='subdivision')
router.register('subdivision-plots', SubdivisionPlotViewSet, basename='subdivisionplot')
router.register('subdivision-roads', RoadReserveViewSet, basename='roadreserve')
router.register('subdivision-utilities', UtilityReserveViewSet, basename='utilityreserve')

urlpatterns = router.urls
