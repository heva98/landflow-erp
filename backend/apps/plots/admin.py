from django.contrib import admin

from .models import Plot


@admin.register(Plot)
class PlotAdmin(admin.ModelAdmin):
    list_display = ('plot_number', 'project', 'block', 'street', 'status', 'area_sqm', 'price')
    list_filter = ('status', 'project')
    search_fields = ('plot_number', 'block', 'street')
