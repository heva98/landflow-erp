from django.contrib import admin

from .models import CommunicationLog, Customer, Lead, Note, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'registration_number', 'phone', 'email')
    search_fields = ('name', 'registration_number', 'tin')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'customer_type', 'organization', 'phone', 'email')
    list_filter = ('customer_type',)
    search_fields = ('full_name', 'phone', 'email')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'status', 'source', 'assigned_to', 'interested_project', 'created_at')
    list_filter = ('status', 'source')
    search_fields = ('full_name', 'phone', 'email')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'object_id', 'author', 'created_at')
    list_filter = ('content_type',)


@admin.register(CommunicationLog)
class CommunicationLogAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'object_id', 'channel', 'direction', 'occurred_at', 'logged_by')
    list_filter = ('channel', 'direction')
