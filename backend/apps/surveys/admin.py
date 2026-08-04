from django.contrib import admin

from .models import (
    Beacon, RoadReserve, Subdivision, SubdivisionPlot, Survey, SurveyCompany, SurveyDocument, Surveyor,
    UtilityReserve,
)


class BeaconInline(admin.TabularInline):
    model = Beacon
    extra = 0


class SurveyDocumentInline(admin.TabularInline):
    model = SurveyDocument
    extra = 0


class SubdivisionPlotInline(admin.TabularInline):
    model = SubdivisionPlot
    extra = 0


class RoadReserveInline(admin.TabularInline):
    model = RoadReserve
    extra = 0


class UtilityReserveInline(admin.TabularInline):
    model = UtilityReserve
    extra = 0


@admin.register(SurveyCompany)
class SurveyCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'license_number', 'contact_person', 'phone', 'is_active')
    search_fields = ('name', 'license_number')


@admin.register(Surveyor)
class SurveyorAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'company', 'license_number', 'is_active')
    list_filter = ('company', 'is_active')
    search_fields = ('full_name', 'license_number')


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'project', 'company', 'lead_surveyor', 'status')
    list_filter = ('status', 'company')
    search_fields = ('reference_number', 'project__name')
    inlines = [BeaconInline, SurveyDocumentInline]


@admin.register(Subdivision)
class SubdivisionAdmin(admin.ModelAdmin):
    list_display = ('survey', 'plan_number', 'status', 'gross_area_sqm', 'net_saleable_area_sqm')
    list_filter = ('status',)
    search_fields = ('plan_number', 'survey__reference_number')
    inlines = [SubdivisionPlotInline, RoadReserveInline, UtilityReserveInline]
