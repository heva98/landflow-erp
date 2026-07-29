from rest_framework.routers import DefaultRouter

from .views import CommunicationLogViewSet, CustomerViewSet, LeadViewSet, NoteViewSet, OrganizationViewSet

router = DefaultRouter()
router.register('organizations', OrganizationViewSet, basename='organization')
router.register('customers', CustomerViewSet, basename='customer')
router.register('leads', LeadViewSet, basename='lead')
router.register('notes', NoteViewSet, basename='note')
router.register('communications', CommunicationLogViewSet, basename='communicationlog')

urlpatterns = router.urls
