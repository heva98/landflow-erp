function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canManageTerritories = (p: string[] | undefined) => has(p, 'agents.add_territory')
export const canManageCommissionPlans = (p: string[] | undefined) => has(p, 'agents.add_commissionplan')
export const canManageAgents = (p: string[] | undefined) => has(p, 'agents.add_agent')
export const canManageSalesTargets = (p: string[] | undefined) => has(p, 'agents.add_salestarget')
export const canApproveCommissionPayments = (p: string[] | undefined) => has(p, 'agents.approve_commissionpayment')
