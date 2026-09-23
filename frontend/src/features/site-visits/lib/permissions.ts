function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canManageSiteVisits = (p: string[] | undefined) => has(p, 'site_visits.add_sitevisit')
export const canManageBookings = (p: string[] | undefined) => has(p, 'site_visits.add_sitevisitbooking')
export const canCheckIn = (p: string[] | undefined) => has(p, 'site_visits.add_sitevisitbooking')
export const canManageDrivers = (p: string[] | undefined) => has(p, 'site_visits.add_driver')
export const canManageBuses = (p: string[] | undefined) => has(p, 'site_visits.add_bus')
export const canManageFollowUps = (p: string[] | undefined) => has(p, 'site_visits.add_followup')
export const canAddFeedback = (p: string[] | undefined) => has(p, 'site_visits.add_visitfeedback')
export const canAddPhotos = (p: string[] | undefined) => has(p, 'site_visits.add_visitphoto')
