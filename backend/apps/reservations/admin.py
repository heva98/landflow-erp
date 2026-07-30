from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('plot', 'customer', 'status', 'reservation_fee', 'reserved_at', 'expiry_date')
    list_filter = ('status',)
    search_fields = ('plot__plot_number', 'customer__full_name')
