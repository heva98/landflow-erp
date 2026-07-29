from rest_framework.routers import DefaultRouter

from .views import PlotViewSet

router = DefaultRouter()
router.register('plots', PlotViewSet, basename='plot')

urlpatterns = router.urls
