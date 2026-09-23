import django_filters

<<<<<<< HEAD
from .models import Beacon, RoadReserve, Subdivision, SubdivisionPlot, SurveyDocument, Surveyor, UtilityReserve
=======
from .models import Beacon, RoadReserve, Subdivision, SubdivisionPlot, Survey, SurveyDocument, Surveyor, UtilityReserve
>>>>>>> 4dfa5005ce0fc8cd0dd6dc643456c2e7c47e09e6


class SurveyorFilter(django_filters.FilterSet):
    class Meta:
        model = Surveyor
        fields = ['company', 'is_active']


<<<<<<< HEAD
class BeaconFilter(django_filters.FilterSet):
    class Meta:
        model = Beacon
        fields = ['survey', 'beacon_type', 'condition']
=======
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
>>>>>>> 4dfa5005ce0fc8cd0dd6dc643456c2e7c47e09e6


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
<<<<<<< HEAD


class SurveyDocumentFilter(django_filters.FilterSet):
    class Meta:
        model = SurveyDocument
        fields = ['survey', 'document_type']
=======
>>>>>>> 4dfa5005ce0fc8cd0dd6dc643456c2e7c47e09e6
