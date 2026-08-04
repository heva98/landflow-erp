import django_filters

from .models import AcquisitionAttachment, LandOwner, Negotiation, PurchaseCost


class LandOwnerFilter(django_filters.FilterSet):
    class Meta:
        model = LandOwner
        fields = ['acquisition']


class NegotiationFilter(django_filters.FilterSet):
    class Meta:
        model = Negotiation
        fields = ['acquisition']


class PurchaseCostFilter(django_filters.FilterSet):
    class Meta:
        model = PurchaseCost
        fields = ['acquisition', 'cost_type']


class AcquisitionAttachmentFilter(django_filters.FilterSet):
    class Meta:
        model = AcquisitionAttachment
        fields = ['acquisition', 'document_type']
