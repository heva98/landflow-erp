from django.contrib import admin

from .models import Installment, InstallmentPayment, PaymentPlan


@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    list_display = ('sale', 'status', 'principal_amount', 'number_of_installments', 'start_date')
    list_filter = ('status',)
    search_fields = ('sale__sale_number',)


@admin.register(Installment)
class InstallmentAdmin(admin.ModelAdmin):
    list_display = ('payment_plan', 'sequence', 'due_date', 'amount_due', 'amount_paid', 'status')
    list_filter = ('status',)
    search_fields = ('payment_plan__sale__sale_number',)


@admin.register(InstallmentPayment)
class InstallmentPaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'installment', 'amount', 'method', 'paid_at')
    list_filter = ('method',)
    search_fields = ('receipt_number', 'installment__payment_plan__sale__sale_number')
