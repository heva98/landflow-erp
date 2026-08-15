from rest_framework import serializers

from .models import (
    Beacon, RoadReserve, Subdivision, SubdivisionPlot, Survey, SurveyCompany, SurveyDocument, Surveyor,
    UtilityReserve,
)


class SurveyCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyCompany
        fields = [
            'id', 'name', 'license_number', 'contact_person', 'phone', 'email', 'address', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SurveyorSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Surveyor
        fields = [
            'id', 'company', 'company_name', 'full_name', 'license_number', 'phone', 'email', 'is_active',
            'user', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BeaconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beacon
        fields = [
            'id', 'survey', 'beacon_number', 'beacon_type', 'condition',
            'latitude', 'longitude', 'easting', 'northing', 'elevation_m', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SurveyDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = SurveyDocument
        fields = [
            'id', 'survey', 'document_type', 'file', 'description',
            'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class SurveySerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    lead_surveyor_name = serializers.CharField(source='lead_surveyor.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, default=None)
    has_subdivision = serializers.SerializerMethodField()

    beacons = BeaconSerializer(many=True, read_only=True)
    documents = SurveyDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Survey
        fields = [
            'id', 'reference_number', 'project', 'project_name', 'company', 'company_name',
            'lead_surveyor', 'lead_surveyor_name', 'status',
            'coordinate_system', 'area_surveyed_sqm', 'scheduled_date', 'completed_date', 'notes',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'created_by', 'created_by_name', 'has_subdivision',
            'beacons', 'documents', 'created_at', 'updated_at',
        ]
        # Status transitions (start/complete/approve/reject) happen only
        # through the dedicated actions below, never by editing these fields.
        read_only_fields = [
            'id', 'reference_number', 'status', 'completed_date',
            'approved_by', 'approved_at', 'rejection_reason',
            'created_by', 'created_at', 'updated_at',
        ]

    def get_has_subdivision(self, obj):
        return hasattr(obj, 'subdivision')

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class RoadReserveSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadReserve
        fields = [
            'id', 'subdivision', 'name', 'road_type', 'width_m', 'length_m', 'area_sqm', 'path_geojson', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UtilityReserveSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilityReserve
        fields = [
            'id', 'subdivision', 'utility_type', 'description', 'area_sqm', 'path_geojson', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubdivisionPlotSerializer(serializers.ModelSerializer):
    is_converted = serializers.SerializerMethodField()

    class Meta:
        model = SubdivisionPlot
        fields = [
            'id', 'subdivision', 'plot_number', 'block', 'street', 'area_sqm', 'land_use',
            'corner_coordinates', 'latitude', 'longitude', 'plot', 'is_converted',
            'created_at', 'updated_at',
        ]
        # 'plot' is set only by the convert_to_plot action, never edited directly.
        read_only_fields = ['id', 'plot', 'created_at', 'updated_at']

    def get_is_converted(self, obj):
        return obj.plot_id is not None


class SubdivisionSerializer(serializers.ModelSerializer):
    survey_reference = serializers.CharField(source='survey.reference_number', read_only=True)
    project_name = serializers.CharField(source='survey.project.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, default=None)

    planned_plots = SubdivisionPlotSerializer(many=True, read_only=True)
    roads = RoadReserveSerializer(many=True, read_only=True)
    utilities = UtilityReserveSerializer(many=True, read_only=True)

    class Meta:
        model = Subdivision
        fields = [
            'id', 'survey', 'survey_reference', 'project_name', 'plan_number', 'status',
            'gross_area_sqm', 'road_reserve_area_sqm', 'utility_reserve_area_sqm', 'open_space_area_sqm',
            'net_saleable_area_sqm', 'approved_by', 'approved_by_name', 'approved_at', 'notes',
            'planned_plots', 'roads', 'utilities', 'created_at', 'updated_at',
        ]
        # Status transitions (submit/approve/reject) happen only through the
        # dedicated actions below, never by editing this field directly.
        read_only_fields = ['id', 'status', 'approved_by', 'approved_at', 'created_at', 'updated_at']
