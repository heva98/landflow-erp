import mimetypes

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.core.models import BaseModel


class Document(BaseModel):
    """
    A reusable, attachable document record. Any model in the system can have
    documents attached by pointing `content_type`/`object_id` at it — no
    per-app join model needed. The actual file content lives on
    `DocumentVersion`; a `Document` is the stable identity across versions.
    """

    class DocumentType(models.TextChoices):
        PDF = 'pdf', 'PDF'
        WORD = 'word', 'Word'
        EXCEL = 'excel', 'Excel'
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'
        CAD = 'cad', 'CAD File'
        GIS = 'gis', 'GIS File'
        OTHER = 'other', 'Other'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    document_type = models.CharField(max_length=10, choices=DocumentType.choices, default=DocumentType.OTHER)
    # Free-text tag for search/grouping, e.g. "Title Deed", "Sale Agreement" — reused across modules.
    category = models.CharField(max_length=100, blank=True)

    # Generic attachment target. Nullable so standalone documents (templates,
    # company policies) are also possible.
    content_type = models.ForeignKey(
        ContentType, null=True, blank=True, on_delete=models.CASCADE, related_name='documents',
    )
    object_id = models.CharField(max_length=255, blank=True, default='')
    content_object = GenericForeignKey('content_type', 'object_id')

    current_version = models.ForeignKey(
        'DocumentVersion', null=True, blank=True, on_delete=models.SET_NULL, related_name='+',
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='documents_uploaded',
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['content_type', 'object_id'])]

    def __str__(self):
        return self.title


class DocumentVersion(BaseModel):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_size = models.PositiveBigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='document_versions_uploaded',
    )

    class Meta:
        ordering = ['-version_number']
        constraints = [
            models.UniqueConstraint(fields=['document', 'version_number'], name='unique_version_number_per_document'),
        ]

    def __str__(self):
        return f'{self.document.title} v{self.version_number}'

    def save(self, *args, **kwargs):
        if self.file:
            if not self.file_size:
                try:
                    self.file_size = self.file.size
                except (OSError, ValueError):
                    pass
            if not self.mime_type:
                guessed, _ = mimetypes.guess_type(self.file.name)
                self.mime_type = guessed or ''
        super().save(*args, **kwargs)
