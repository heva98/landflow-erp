export function canCreatePaymentPlans(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('installments.add_paymentplan')
}

export function canRecordPayments(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('installments.add_installmentpayment')
}
