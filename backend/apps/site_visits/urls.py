from rest_framework.routers import DefaultRouter

from .views import (
    BusViewSet, DriverViewSet, FollowUpViewSet, SiteVisitBookingViewSet, SiteVisitViewSet, VisitFeedbackViewSet,
    VisitPhotoViewSet,
)

router = DefaultRouter()
router.register('drivers', DriverViewSet, basename='driver')
router.register('buses', BusViewSet, basename='bus')
router.register('site-visits', SiteVisitViewSet, basename='sitevisit')
router.register('site-visit-bookings', SiteVisitBookingViewSet, basename='sitevisitbooking')
router.register('site-visit-feedback', VisitFeedbackViewSet, basename='visitfeedback')
router.register('site-visit-photos', VisitPhotoViewSet, basename='visitphoto')
router.register('site-visit-follow-ups', FollowUpViewSet, basename='followup')

urlpatterns = router.urls
