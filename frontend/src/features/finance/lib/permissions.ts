export function canManageAccounts(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('finance.add_account')
}

export function canManageCashBankAccounts(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('finance.add_cashbankaccount')
}

export function canRecordIncome(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('finance.add_income')
}

export function canRecordExpense(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('finance.add_expense')
}

export function canViewFinanceReports(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('finance.view_journalline')
}
