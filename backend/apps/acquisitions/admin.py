from django.contrib import admin

from .models import AcquisitionAttachment, LandAcquisition, LandOwner, Negotiation, PurchaseCost


class LandOwnerInline(admin.TabularInline):
    model = LandOwner
    extra = 0


class NegotiationInline(admin.TabularInline):
    model = Negotiation
    extra = 0


class PurchaseCostInline(admin.TabularInline):
    model = PurchaseCost
    extra = 0


class AcquisitionAttachmentInline(admin.TabularInline):
    model = AcquisitionAttachment
    extra = 0


@admin.register(LandAcquisition)
class LandAcquisitionAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'name', 'status', 'location', 'area_sqm', 'purchase_price')
    list_filter = ('status',)
    search_fields = ('reference_number', 'name', 'location')
    inlines = [LandOwnerInline, NegotiationInline, PurchaseCostInline, AcquisitionAttachmentInline]
