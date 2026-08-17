function has(permissions: string[] | undefined, codename: string): boolean {
  if (!permissions) return false
  return permissions.includes('*') || permissions.includes(codename)
}

export const canManageDepartments = (p: string[] | undefined) => has(p, 'hr.add_department')
export const canManageEmployees = (p: string[] | undefined) => has(p, 'hr.add_employee')
export const canManageAttendance = (p: string[] | undefined) => has(p, 'hr.add_attendance')
export const canManageLeaveTypes = (p: string[] | undefined) => has(p, 'hr.add_leavetype')
export const canManageLeaveRequests = (p: string[] | undefined) => has(p, 'hr.add_leaverequest')
export const canApproveLeaveRequests = (p: string[] | undefined) => has(p, 'hr.approve_leaverequest')
export const canManagePerformanceReviews = (p: string[] | undefined) => has(p, 'hr.add_performancereview')
export const canManagePayroll = (p: string[] | undefined) => has(p, 'hr.add_payrollrecord')
