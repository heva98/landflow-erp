import django_filters

from .models import Installment, InstallmentPayment, PaymentPlan


class PaymentPlanFilter(django_filters.FilterSet):
    customer = django_filters.UUIDFilter(field_name='sale__customer_id')

    class Meta:
        model = PaymentPlan
        fields = ['sale', 'customer', 'status']


class InstallmentFilter(django_filters.FilterSet):
    customer = django_filters.UUIDFilter(field_name='payment_plan__sale__customer_id')

    class Meta:
        model = Installment
        fields = ['payment_plan', 'customer', 'status']


class InstallmentPaymentFilter(django_filters.FilterSet):
    customer = django_filters.UUIDFilter(field_name='installment__payment_plan__sale__customer_id')

    class Meta:
        model = InstallmentPayment
        fields = ['installment', 'customer', 'method']
