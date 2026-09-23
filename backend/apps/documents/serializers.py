from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import Document, DocumentVersion


class ContentTypeField(serializers.Field):
    """Reads/writes a ContentType as "<app_label>.<model>", e.g. "acquisitions.landacquisition"."""

    def to_representation(self, value):
        return f'{value.app_label}.{value.model}' if value else None

    def to_internal_value(self, data):
        try:
            app_label, model = str(data).split('.')
            return ContentType.objects.get(app_label=app_label, model=model)
        except (ValueError, ContentType.DoesNotExist):
            raise serializers.ValidationError('Must be "<app_label>.<model>" for a known model, e.g. "acquisitions.landacquisition".')


class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True, default=None)

    class Meta:
        model = DocumentVersion
        fields = [
            'id', 'document', 'version_number', 'file', 'file_size', 'mime_type', 'notes',
            'uploaded_by', 'uploaded_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'document', 'version_number', 'file_size', 'mime_type', 'uploaded_by', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    content_type = ContentTypeField(required=False, allow_null=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True, default=None)
    current_version = DocumentVersionSerializer(read_only=True)
    versions = DocumentVersionSerializer(many=True, read_only=True)
    version_count = serializers.IntegerField(source='versions.count', read_only=True)

    # Write-only: seeds version 1 on create. New versions after that go
    # through the upload_version action, not this field.
    file = serializers.FileField(write_only=True, required=False)
    version_notes = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'document_type', 'category',
            'content_type', 'object_id',
            'current_version', 'versions', 'version_count',
            'uploaded_by', 'uploaded_by_name',
            'file', 'version_notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        if self.instance is None and not attrs.get('file'):
            raise serializers.ValidationError({'file': 'A file is required to create a document.'})
        return attrs

    def create(self, validated_data):
        file = validated_data.pop('file')
        notes = validated_data.pop('version_notes', '')
        user = self.context['request'].user

        validated_data['uploaded_by'] = user
        document = Document.objects.create(**validated_data)
        version = DocumentVersion.objects.create(
            document=document, version_number=1, file=file, uploaded_by=user, notes=notes,
        )
        document.current_version = version
        document.save(update_fields=['current_version'])
        return document

    def update(self, instance, validated_data):
        # Metadata only — files are never replaced via PATCH, only through
        # the upload_version action, which preserves version history.
        validated_data.pop('file', None)
        validated_data.pop('version_notes', None)
        return super().update(instance, validated_data)
