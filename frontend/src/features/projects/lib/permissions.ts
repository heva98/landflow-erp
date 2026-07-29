export function canViewProjectFinancials(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('projects.view_project_financials')
}
