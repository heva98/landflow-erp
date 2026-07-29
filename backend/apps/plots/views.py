from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import RoleBasedModelPermissions

from .filters import PlotFilter
from .models import Plot
from .serializers import PlotSerializer


class PlotViewSet(viewsets.ModelViewSet):
    queryset = Plot.objects.select_related('project').all()
    serializer_class = PlotSerializer
    permission_classes = [IsAuthenticated, RoleBasedModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PlotFilter
    search_fields = ['plot_number', 'block', 'street']
    ordering_fields = ['plot_number', 'created_at', 'area_sqm', 'price', 'status']
