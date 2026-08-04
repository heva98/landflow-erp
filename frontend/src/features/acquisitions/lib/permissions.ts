export function canAddAcquisitions(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('acquisitions.add_landacquisition')
}

export function canEditAcquisitions(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('acquisitions.change_landacquisition')
}

export function canManageAcquisitionWorkflow(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('acquisitions.approve_landacquisition')
}
