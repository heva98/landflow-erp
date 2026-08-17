function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canManageSurveys = (p: string[] | undefined) => has(p, 'surveys.add_survey')
export const canApproveSurveys = (p: string[] | undefined) => has(p, 'surveys.approve_survey')
export const canManageSurveyCompanies = (p: string[] | undefined) => has(p, 'surveys.add_surveycompany')
export const canManageSurveyors = (p: string[] | undefined) => has(p, 'surveys.add_surveyor')
export const canConvertSubdivisionPlots = (p: string[] | undefined) => has(p, 'plots.add_plot')
