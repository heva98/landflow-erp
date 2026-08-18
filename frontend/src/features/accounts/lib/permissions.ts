function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canManageUsers = (p: string[] | undefined) => has(p, 'accounts.add_user')
export const canViewRoles = (p: string[] | undefined) => has(p, 'accounts.view_role')
