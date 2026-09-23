function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canManageSaleAgreements = (p: string[] | undefined) => has(p, 'legal.add_saleagreement')
export const canApproveSaleAgreements = (p: string[] | undefined) => has(p, 'legal.approve_saleagreement')

export const canManageTitleDeeds = (p: string[] | undefined) => has(p, 'legal.add_titledeed')
export const canApproveTitleDeeds = (p: string[] | undefined) => has(p, 'legal.approve_titledeed')

export const canManagePowersOfAttorney = (p: string[] | undefined) => has(p, 'legal.add_powerofattorney')
export const canApprovePowersOfAttorney = (p: string[] | undefined) => has(p, 'legal.approve_powerofattorney')

export const canManageContracts = (p: string[] | undefined) => has(p, 'legal.add_contract')

export const canManageOwnershipTransfers = (p: string[] | undefined) => has(p, 'legal.add_ownershiptransfer')
export const canApproveOwnershipTransfers = (p: string[] | undefined) => has(p, 'legal.approve_ownershiptransfer')

export const canManageDocumentTemplates = (p: string[] | undefined) => has(p, 'legal.add_documenttemplate')
export const canManageWitnesses = (p: string[] | undefined) => has(p, 'legal.add_witness')
