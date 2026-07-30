export function canCreateReservations(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('reservations.add_reservation')
}

export function canManageReservations(permissions: string[] | undefined): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes('reservations.change_reservation')
}
