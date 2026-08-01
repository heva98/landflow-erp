export function canCreateSales(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('sales.add_sale')
}

export function canManageSales(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('sales.change_sale')
}
