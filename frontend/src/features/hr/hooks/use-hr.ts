import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  activateEmployee,
  approveLeaveRequest,
  cancelLeaveRequest,
  createAttendance,
  createDepartment,
  createEmployee,
  createLeaveRequest,
  createLeaveType,
  createPayrollRecord,
  createPerformanceReview,
  fetchAttendance,
  fetchDepartments,
  fetchEmployee,
  fetchEmployees,
  fetchLeaveRequests,
  fetchLeaveTypes,
  fetchPayrollRecords,
  fetchPerformanceReviews,
  markPayrollRecordPaid,
  processPayrollRecord,
  putEmployeeOnLeave,
  rejectLeaveRequest,
  suspendEmployee,
  terminateEmployee,
  updateDepartment,
  updateEmployee,
} from '../api/hr-api'
import type {
  DepartmentInput,
  EmployeeInput,
  LeaveRequestInput,
  LeaveTypeInput,
  PayrollRecordInput,
  PerformanceReviewInput,
} from '../types'

// -- Departments --------------------------------------------------------------

export function useDepartmentsQuery(params: { search?: string } = {}) {
  return useQuery({ queryKey: ['departments', params], queryFn: () => fetchDepartments(params) })
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DepartmentInput) => createDepartment(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export function useUpdateDepartmentMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DepartmentInput) => updateDepartment(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

// -- Employees ------------------------------------------------------------------

export function useEmployeesQuery(
  params: { search?: string; department?: string; status?: string; employment_type?: string } = {},
) {
  return useQuery({ queryKey: ['employees', params], queryFn: () => fetchEmployees(params) })
}

export function useEmployeeQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => fetchEmployee(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useUpdateEmployeeMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) => updateEmployee(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

function useEmployeeInvalidate(id: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['employees', id] })
    queryClient.invalidateQueries({ queryKey: ['employees'] })
  }
}

export function useActivateEmployeeMutation(id: string) {
  const invalidate = useEmployeeInvalidate(id)
  return useMutation({ mutationFn: () => activateEmployee(id), onSuccess: invalidate })
}

export function usePutEmployeeOnLeaveMutation(id: string) {
  const invalidate = useEmployeeInvalidate(id)
  return useMutation({ mutationFn: () => putEmployeeOnLeave(id), onSuccess: invalidate })
}

export function useSuspendEmployeeMutation(id: string) {
  const invalidate = useEmployeeInvalidate(id)
  return useMutation({ mutationFn: () => suspendEmployee(id), onSuccess: invalidate })
}

export function useTerminateEmployeeMutation(id: string) {
  const invalidate = useEmployeeInvalidate(id)
  return useMutation({
    mutationFn: (termination_date?: string) => terminateEmployee(id, termination_date),
    onSuccess: invalidate,
  })
}

// -- Attendance ----------------------------------------------------------------

export function useAttendanceQuery(params: { employee?: string; date?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['attendance', params], queryFn: () => fetchAttendance(params) })
}

export function useCreateAttendanceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      employee: string
      date: string
      status: string
      check_in?: string
      check_out?: string
      notes?: string
    }) => createAttendance(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  })
}

// -- Leave types -----------------------------------------------------------------

export function useLeaveTypesQuery(params: { search?: string } = {}) {
  return useQuery({ queryKey: ['leave-types', params], queryFn: () => fetchLeaveTypes(params) })
}

export function useCreateLeaveTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LeaveTypeInput) => createLeaveType(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-types'] }),
  })
}

// -- Leave requests --------------------------------------------------------------

export function useLeaveRequestsQuery(params: { employee?: string; leave_type?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['leave-requests', params], queryFn: () => fetchLeaveRequests(params) })
}

export function useCreateLeaveRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LeaveRequestInput) => createLeaveRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  })
}

export function useApproveLeaveRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approveLeaveRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  })
}

export function useRejectLeaveRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: string; rejection_reason?: string }) =>
      rejectLeaveRequest(id, rejection_reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  })
}

export function useCancelLeaveRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelLeaveRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  })
}

// -- Performance reviews -----------------------------------------------------------

export function usePerformanceReviewsQuery(params: { employee?: string } = {}) {
  return useQuery({ queryKey: ['performance-reviews', params], queryFn: () => fetchPerformanceReviews(params) })
}

export function useCreatePerformanceReviewMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PerformanceReviewInput) => createPerformanceReview(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews'] }),
  })
}

// -- Payroll ------------------------------------------------------------------------

export function usePayrollRecordsQuery(params: { employee?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['payroll-records', params], queryFn: () => fetchPayrollRecords(params) })
}

export function useCreatePayrollRecordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PayrollRecordInput) => createPayrollRecord(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-records'] }),
  })
}

export function useProcessPayrollRecordMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => processPayrollRecord(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-records'] }),
  })
}

export function useMarkPayrollRecordPaidMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markPayrollRecordPaid(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-records'] }),
  })
}
