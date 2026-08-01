from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'
    label = 'notifications'

    def ready(self):
        from apps.core.audit import register_for_audit

        from .models import Notification

        register_for_audit(Notification)
