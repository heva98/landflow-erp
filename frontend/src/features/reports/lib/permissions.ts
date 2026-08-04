function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export function canViewSalesReport(permissions: string[] | undefined): boolean {
  return has(permissions, 'sales.view_sale')
}

export function canViewInstallmentReport(permissions: string[] | undefined): boolean {
  return has(permissions, 'installments.view_installment')
}

export function canViewLeadReport(permissions: string[] | undefined): boolean {
  return has(permissions, 'crm.view_lead')
}

export function canViewLandInventoryReport(permissions: string[] | undefined): boolean {
  return has(permissions, 'plots.view_plot')
}

export function canViewCashFlowReport(permissions: string[] | undefined): boolean {
  return has(permissions, 'finance.view_journalline')
}
