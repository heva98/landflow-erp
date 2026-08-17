import django_filters

from .models import Contract, DocumentTemplate, OwnershipTransfer, PowerOfAttorney, SaleAgreement, TitleDeed, Witness


class SaleAgreementFilter(django_filters.FilterSet):
    class Meta:
        model = SaleAgreement
        fields = ['sale', 'status']


class TitleDeedFilter(django_filters.FilterSet):
    class Meta:
        model = TitleDeed
        fields = ['sale', 'status']


class PowerOfAttorneyFilter(django_filters.FilterSet):
    class Meta:
        model = PowerOfAttorney
        fields = ['sale', 'status']


class ContractFilter(django_filters.FilterSet):
    # "<app_label>.<model>", e.g. "surveys.surveycompany" — pairs with
    # object_id to fetch every contract concerning one specific record.
    content_type = django_filters.CharFilter(method='filter_content_type')

    class Meta:
        model = Contract
        fields = ['contract_type', 'status', 'content_type', 'object_id']

    def filter_content_type(self, queryset, name, value):
        try:
            app_label, model = value.split('.')
        except ValueError:
            return queryset.none()
        return queryset.filter(content_type__app_label=app_label, content_type__model=model)


class OwnershipTransferFilter(django_filters.FilterSet):
    class Meta:
        model = OwnershipTransfer
        fields = ['sale', 'status']


class WitnessFilter(django_filters.FilterSet):
    # "<app_label>.<model>", e.g. "legal.saleagreement" — pairs with object_id
    # to fetch every witness for one specific legal record.
    content_type = django_filters.CharFilter(method='filter_content_type')

    class Meta:
        model = Witness
        fields = ['content_type', 'object_id']

    def filter_content_type(self, queryset, name, value):
        try:
            app_label, model = value.split('.')
        except ValueError:
            return queryset.none()
        return queryset.filter(content_type__app_label=app_label, content_type__model=model)


class DocumentTemplateFilter(django_filters.FilterSet):
    class Meta:
        model = DocumentTemplate
        fields = ['template_type', 'is_active']
