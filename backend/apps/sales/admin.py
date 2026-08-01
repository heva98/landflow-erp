from django.contrib import admin

from .models import Invoice, Receipt, Sale


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('sale_number', 'plot', 'customer', 'sale_type', 'status', 'sale_price', 'sold_at')
    list_filter = ('sale_type', 'status')
    search_fields = ('sale_number', 'plot__plot_number', 'customer__full_name')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'sale', 'amount', 'issued_at', 'due_date')
    search_fields = ('invoice_number', 'sale__sale_number')


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'sale', 'amount', 'payment_method', 'received_at')
    list_filter = ('payment_method',)
    search_fields = ('receipt_number', 'sale__sale_number')
