from django.contrib import admin

from .models import Agent, CommissionPayment, CommissionPlan, CommissionTier, SalesTarget, Territory


@admin.register(Territory)
class TerritoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'region')
    search_fields = ('name', 'region')


class CommissionTierInline(admin.TabularInline):
    model = CommissionTier
    extra = 0


@admin.register(CommissionPlan)
class CommissionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan_type', 'rate_percent', 'flat_amount', 'is_active')
    list_filter = ('plan_type', 'is_active')
    search_fields = ('name',)
    inlines = [CommissionTierInline]


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('agent_code', 'employee', 'territory', 'commission_plan', 'is_active')
    list_filter = ('is_active', 'territory')
    search_fields = ('agent_code', 'employee__full_name')


@admin.register(SalesTarget)
class SalesTargetAdmin(admin.ModelAdmin):
    list_display = ('agent', 'period_start', 'period_end', 'target_amount', 'achieved_amount')
    search_fields = ('agent__agent_code', 'agent__employee__full_name')


@admin.register(CommissionPayment)
class CommissionPaymentAdmin(admin.ModelAdmin):
    list_display = ('agent', 'sale', 'amount', 'status', 'calculated_at')
    list_filter = ('status',)
    search_fields = ('agent__agent_code', 'agent__employee__full_name', 'sale__sale_number')
