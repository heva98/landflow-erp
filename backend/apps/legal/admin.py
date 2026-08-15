from django.contrib import admin

from .models import Contract, DocumentTemplate, OwnershipTransfer, PowerOfAttorney, SaleAgreement, TitleDeed, Witness


@admin.register(SaleAgreement)
class SaleAgreementAdmin(admin.ModelAdmin):
    list_display = ('agreement_number', 'sale', 'status', 'signed_date')
    list_filter = ('status',)
    search_fields = ('agreement_number', 'sale__sale_number')


@admin.register(TitleDeed)
class TitleDeedAdmin(admin.ModelAdmin):
    list_display = ('sale', 'deed_number', 'status', 'issued_date')
    list_filter = ('status',)
    search_fields = ('deed_number', 'sale__sale_number')


@admin.register(PowerOfAttorney)
class PowerOfAttorneyAdmin(admin.ModelAdmin):
    list_display = ('poa_number', 'grantor_name', 'grantee_name', 'status', 'expiry_date')
    list_filter = ('status',)
    search_fields = ('poa_number', 'grantor_name', 'grantee_name')


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ('contract_number', 'title', 'contract_type', 'status', 'counterparty_name')
    list_filter = ('contract_type', 'status')
    search_fields = ('contract_number', 'title', 'counterparty_name')


@admin.register(OwnershipTransfer)
class OwnershipTransferAdmin(admin.ModelAdmin):
    list_display = ('transfer_number', 'sale', 'status', 'approved_by', 'completed_at')
    list_filter = ('status',)
    search_fields = ('transfer_number', 'sale__sale_number')


@admin.register(Witness)
class WitnessAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'national_id', 'phone', 'content_type', 'object_id', 'signed_at')
    list_filter = ('content_type',)
    search_fields = ('full_name', 'national_id')


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'is_active')
    list_filter = ('template_type', 'is_active')
    search_fields = ('name',)
