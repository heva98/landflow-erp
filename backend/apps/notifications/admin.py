from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('notification_type', 'channel', 'recipient_email', 'status', 'sent_at', 'created_at')
    list_filter = ('notification_type', 'channel', 'status')
    search_fields = ('recipient_email', 'subject')
