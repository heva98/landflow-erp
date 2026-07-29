from rest_framework import serializers

from .models import Project

FINANCIAL_FIELDS = ('acquisition_cost', 'development_cost', 'expected_revenue', 'total_cost', 'roi_percent')


class ProjectSerializer(serializers.ModelSerializer):
    total_cost = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    roi_percent = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True, allow_null=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'status', 'description',
            'location', 'latitude', 'longitude',
            'master_plan_url', 'map_url', 'image_urls', 'video_urls', 'nearby_services',
            'total_area_sqm',
            'acquisition_cost', 'development_cost', 'expected_revenue', 'total_cost', 'roi_percent',
            'start_date', 'expected_completion_date',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user = getattr(self.context.get('request'), 'user', None)
        if not (user and user.is_authenticated and user.has_perm('projects.view_project_financials')):
            for field_name in FINANCIAL_FIELDS:
                self.fields.pop(field_name, None)
