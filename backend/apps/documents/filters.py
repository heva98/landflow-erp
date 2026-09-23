import django_filters

from .models import Document, DocumentVersion


class DocumentFilter(django_filters.FilterSet):
    # "<app_label>.<model>", e.g. "acquisitions.landacquisition" — pairs with
    # object_id to fetch every document attached to one specific record.
    content_type = django_filters.CharFilter(method='filter_content_type')

    class Meta:
        model = Document
        fields = ['document_type', 'category', 'content_type', 'object_id']

    def filter_content_type(self, queryset, name, value):
        try:
            app_label, model = value.split('.')
        except ValueError:
            return queryset.none()
        return queryset.filter(content_type__app_label=app_label, content_type__model=model)


class DocumentVersionFilter(django_filters.FilterSet):
    class Meta:
        model = DocumentVersion
        fields = ['document']
