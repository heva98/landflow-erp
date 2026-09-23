from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source='actor.email', read_only=True, default=None)
    content_type_app_label = serializers.CharField(source='content_type.app_label', read_only=True)
    content_type_model = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'content_type_app_label', 'content_type_model', 'object_id', 'object_repr',
            'changes', 'actor', 'actor_email', 'created_at',
        ]
        read_only_fields = fields
