from django.contrib import admin

from .models import Bus, Driver, FollowUp, SiteVisit, SiteVisitBooking, VisitFeedback, VisitPhoto


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'license_number', 'is_active')
    search_fields = ('full_name', 'license_number')


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('registration_number', 'capacity', 'driver', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('registration_number',)


class SiteVisitBookingInline(admin.TabularInline):
    model = SiteVisitBooking
    extra = 0


class VisitPhotoInline(admin.TabularInline):
    model = VisitPhoto
    extra = 0


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'project', 'visit_date', 'status', 'bus')
    list_filter = ('status', 'project')
    search_fields = ('reference_number', 'project__name')
    inlines = [SiteVisitBookingInline, VisitPhotoInline]


@admin.register(SiteVisitBooking)
class SiteVisitBookingAdmin(admin.ModelAdmin):
    list_display = ('lead', 'site_visit', 'status', 'guest_count', 'is_checked_in')
    list_filter = ('status',)
    search_fields = ('lead__full_name', 'site_visit__reference_number', 'qr_token')


@admin.register(VisitFeedback)
class VisitFeedbackAdmin(admin.ModelAdmin):
    list_display = ('booking', 'rating', 'interested_in_purchasing', 'submitted_at')
    list_filter = ('rating', 'interested_in_purchasing')


@admin.register(FollowUp)
class FollowUpAdmin(admin.ModelAdmin):
    list_display = ('booking', 'due_date', 'status', 'assigned_to')
    list_filter = ('status',)
