from django.contrib import admin

from .models import Document, DocumentVersion


class DocumentVersionInline(admin.TabularInline):
    model = DocumentVersion
    extra = 0
    fk_name = 'document'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'document_type', 'category', 'content_type', 'object_id', 'uploaded_by')
    list_filter = ('document_type', 'category', 'content_type')
    search_fields = ('title', 'description', 'category')
    inlines = [DocumentVersionInline]


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ('document', 'version_number', 'file_size', 'mime_type', 'uploaded_by', 'created_at')
    list_filter = ('mime_type',)
    search_fields = ('document__title',)
