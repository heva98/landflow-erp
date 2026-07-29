import django_filters

from .models import CommunicationLog, Customer, Lead, Note


class LeadFilter(django_filters.FilterSet):
    class Meta:
        model = Lead
        fields = ['status', 'source', 'organization', 'interested_project', 'assigned_to', 'referred_by']


class CustomerFilter(django_filters.FilterSet):
    class Meta:
        model = Customer
        fields = ['customer_type', 'organization']


class NoteFilter(django_filters.FilterSet):
    target_type = django_filters.CharFilter(field_name='content_type__model')

    class Meta:
        model = Note
        fields = ['target_type', 'object_id']


class CommunicationLogFilter(django_filters.FilterSet):
    target_type = django_filters.CharFilter(field_name='content_type__model')

    class Meta:
        model = CommunicationLog
        fields = ['channel', 'direction', 'target_type', 'object_id']
