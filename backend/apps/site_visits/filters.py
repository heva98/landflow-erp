import django_filters

from .models import Bus, Driver, FollowUp, SiteVisit, SiteVisitBooking, VisitFeedback, VisitPhoto


class DriverFilter(django_filters.FilterSet):
    class Meta:
        model = Driver
        fields = ['is_active']


class BusFilter(django_filters.FilterSet):
    class Meta:
        model = Bus
        fields = ['is_active', 'driver']


class SiteVisitFilter(django_filters.FilterSet):
    class Meta:
        model = SiteVisit
        fields = ['project', 'status']


class SiteVisitBookingFilter(django_filters.FilterSet):
    class Meta:
        model = SiteVisitBooking
        fields = ['site_visit', 'lead', 'status']


class VisitFeedbackFilter(django_filters.FilterSet):
    class Meta:
        model = VisitFeedback
        fields = ['booking']


class VisitPhotoFilter(django_filters.FilterSet):
    class Meta:
        model = VisitPhoto
        fields = ['site_visit']


class FollowUpFilter(django_filters.FilterSet):
    class Meta:
        model = FollowUp
        fields = ['booking', 'status', 'assigned_to']
