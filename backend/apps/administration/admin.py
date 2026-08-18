from django.contrib import admin

from .models import ActivityLog, ApprovalStep, ApprovalWorkflow, Currency, Location, SystemSetting


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'exchange_rate', 'is_base', 'is_active')
    list_filter = ('is_active', 'is_base')
    search_fields = ('code', 'name')


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'location_type', 'parent', 'is_active')
    list_filter = ('location_type', 'is_active')
    search_fields = ('name',)


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'base_currency', 'timezone')

    def has_add_permission(self, request):
        return not SystemSetting.objects.exists()


class ApprovalStepInline(admin.TabularInline):
    model = ApprovalStep
    extra = 1


@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display = ('name', 'workflow_type', 'min_amount', 'is_active')
    list_filter = ('workflow_type', 'is_active')
    search_fields = ('name',)
    inlines = [ApprovalStepInline]


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'action', 'actor', 'description')
    list_filter = ('action',)
    search_fields = ('description', 'actor__email')
    readonly_fields = [f.name for f in ActivityLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
