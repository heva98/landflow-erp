from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from .models import Plot

FINANCIAL_WRITE_FIELDS = ('price', 'discount')


class PlotSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    final_price = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True, default=None)

    class Meta:
        model = Plot
        fields = [
            'id', 'project', 'project_name', 'plot_number', 'block', 'street', 'status',
            'area_sqm', 'price', 'discount', 'final_price',
            'latitude', 'longitude', 'polygon_geojson', 'corner_coordinates',
            'google_maps_url', 'nearby_schools', 'nearby_roads', 'nearby_hospitals',
            'image_urls', 'images_360_urls', 'owner', 'owner_name',
            'created_at', 'updated_at',
        ]
        # Ownership is set only by the Sales flow (on sale creation/cancellation),
        # never edited directly through the plot form.
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user = getattr(self.context.get('request'), 'user', None)
        if not (user and user.is_authenticated and user.has_perm('plots.set_plot_financials')):
            for field_name in FINANCIAL_WRITE_FIELDS:
                self.fields[field_name].read_only = True

    def validate(self, attrs):
        project = attrs.get('project') or (self.instance.project if self.instance else None)
        area_sqm = attrs.get('area_sqm')
        if area_sqm is None and self.instance:
            area_sqm = self.instance.area_sqm

        if project is not None and area_sqm is not None:
            if area_sqm > project.total_area_sqm:
                raise serializers.ValidationError({
                    'area_sqm': "Plot area cannot exceed the project's total area.",
                })

            other_plots = project.plots.all()
            if self.instance:
                other_plots = other_plots.exclude(pk=self.instance.pk)
            other_plots_area = other_plots.aggregate(total=Sum('area_sqm'))['total'] or Decimal('0')

            if other_plots_area + area_sqm > project.total_area_sqm:
                remaining = project.total_area_sqm - other_plots_area
                raise serializers.ValidationError({
                    'area_sqm': (
                        f'Total plot area for {project.name} would exceed its total area '
                        f'({project.total_area_sqm} sqm). Only {remaining} sqm remaining.'
                    ),
                })

        return attrs
