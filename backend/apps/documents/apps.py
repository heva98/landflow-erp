from django.apps import AppConfig


class DocumentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.documents'
    label = 'documents'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Document, DocumentVersion

        register_for_audit(Document)
        register_for_audit(DocumentVersion)
