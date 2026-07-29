from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'location', 'total_area_sqm', 'expected_revenue')
    list_filter = ('status',)
    search_fields = ('name', 'location')
