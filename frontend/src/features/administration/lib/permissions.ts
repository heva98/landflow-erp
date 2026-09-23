function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canManageCurrencies = (p: string[] | undefined) => has(p, 'administration.add_currency')
export const canManageLocations = (p: string[] | undefined) => has(p, 'administration.add_location')
export const canManageSettings = (p: string[] | undefined) => has(p, 'administration.change_systemsetting')
export const canManageApprovalWorkflows = (p: string[] | undefined) => has(p, 'administration.add_approvalworkflow')
