import django_filters

from .models import Beacon, RoadReserve, Subdivision, SubdivisionPlot, Survey, SurveyDocument, Surveyor, UtilityReserve


class SurveyorFilter(django_filters.FilterSet):
    class Meta:
        model = Surveyor
        fields = ['company', 'is_active']


class SurveyFilter(django_filters.FilterSet):
    class Meta:
        model = Survey
        fields = ['project', 'company', 'lead_surveyor', 'status']


class BeaconFilter(django_filters.FilterSet):
    class Meta:
        model = Beacon
        fields = ['survey', 'condition']


class SurveyDocumentFilter(django_filters.FilterSet):
    class Meta:
        model = SurveyDocument
        fields = ['survey', 'document_type']


class SubdivisionFilter(django_filters.FilterSet):
    class Meta:
        model = Subdivision
        fields = ['survey', 'status']


class SubdivisionPlotFilter(django_filters.FilterSet):
    class Meta:
        model = SubdivisionPlot
        fields = ['subdivision', 'land_use']


class RoadReserveFilter(django_filters.FilterSet):
    class Meta:
        model = RoadReserve
        fields = ['subdivision', 'road_type']


class UtilityReserveFilter(django_filters.FilterSet):
    class Meta:
        model = UtilityReserve
        fields = ['subdivision', 'utility_type']
