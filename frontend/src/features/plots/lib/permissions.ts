export function canEditPlots(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('plots.change_plot')
}

export function canSetPlotFinancials(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('plots.set_plot_financials')
}
