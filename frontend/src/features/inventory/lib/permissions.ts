function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canViewInventory = (p: string[] | undefined) => has(p, 'plots.view_plot')
export const canViewFutureProjects = (p: string[] | undefined) => has(p, 'projects.view_project')
