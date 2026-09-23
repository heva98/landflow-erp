import { apiClient } from '@/lib/api-client'

import type {
  Attendance,
  Department,
  DepartmentInput,
  Employee,
  EmployeeInput,
  LeaveRequest,
  LeaveRequestInput,
  LeaveType,
  LeaveTypeInput,
  PaginatedResponse,
  PayrollRecord,
  PayrollRecordInput,
  PerformanceReview,
  PerformanceReviewInput,
} from '../types'

// -- Departments --------------------------------------------------------------

export async function fetchDepartments(params: { search?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<Department>>('/departments/', { params })
  return response.data
}

export async function createDepartment(input: DepartmentInput) {
  const response = await apiClient.post<Department>('/departments/', input)
  return response.data
}

export async function updateDepartment(id: string, input: DepartmentInput) {
  const response = await apiClient.put<Department>(`/departments/${id}/`, input)
  return response.data
}

// -- Employees ------------------------------------------------------------------

export async function fetchEmployees(
  params: { search?: string; department?: string; status?: string; employment_type?: string } = {},
) {
  const response = await apiClient.get<PaginatedResponse<Employee>>('/employees/', { params })
  return response.data
}

export async function fetchEmployee(id: string) {
  const response = await apiClient.get<Employee>(`/employees/${id}/`)
  return response.data
}

export async function createEmployee(input: EmployeeInput) {
  const response = await apiClient.post<Employee>('/employees/', input)
  return response.data
}

export async function updateEmployee(id: string, input: EmployeeInput) {
  const response = await apiClient.put<Employee>(`/employees/${id}/`, input)
  return response.data
}

export async function activateEmployee(id: string) {
  const response = await apiClient.post<Employee>(`/employees/${id}/activate/`)
  return response.data
}

export async function putEmployeeOnLeave(id: string) {
  const response = await apiClient.post<Employee>(`/employees/${id}/put_on_leave/`)
  return response.data
}

export async function suspendEmployee(id: string) {
  const response = await apiClient.post<Employee>(`/employees/${id}/suspend/`)
  return response.data
}

export async function terminateEmployee(id: string, termination_date?: string) {
  const response = await apiClient.post<Employee>(`/employees/${id}/terminate/`, { termination_date })
  return response.data
}

// -- Attendance ----------------------------------------------------------------

export async function fetchAttendance(params: { employee?: string; date?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<Attendance>>('/attendance/', { params })
  return response.data
}

export async function createAttendance(input: {
  employee: string
  date: string
  status: string
  check_in?: string
  check_out?: string
  notes?: string
}) {
  const response = await apiClient.post<Attendance>('/attendance/', input)
  return response.data
}

// -- Leave types -----------------------------------------------------------------

export async function fetchLeaveTypes(params: { search?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<LeaveType>>('/leave-types/', { params })
  return response.data
}

export async function createLeaveType(input: LeaveTypeInput) {
  const response = await apiClient.post<LeaveType>('/leave-types/', input)
  return response.data
}

// -- Leave requests --------------------------------------------------------------

export async function fetchLeaveRequests(params: { employee?: string; leave_type?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<LeaveRequest>>('/leave-requests/', { params })
  return response.data
}

export async function createLeaveRequest(input: LeaveRequestInput) {
  const response = await apiClient.post<LeaveRequest>('/leave-requests/', input)
  return response.data
}

export async function approveLeaveRequest(id: string) {
  const response = await apiClient.post<LeaveRequest>(`/leave-requests/${id}/approve/`)
  return response.data
}

export async function rejectLeaveRequest(id: string, rejection_reason?: string) {
  const response = await apiClient.post<LeaveRequest>(`/leave-requests/${id}/reject/`, { rejection_reason })
  return response.data
}

export async function cancelLeaveRequest(id: string) {
  const response = await apiClient.post<LeaveRequest>(`/leave-requests/${id}/cancel/`)
  return response.data
}

// -- Performance reviews -----------------------------------------------------------

export async function fetchPerformanceReviews(params: { employee?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<PerformanceReview>>('/performance-reviews/', { params })
  return response.data
}

export async function createPerformanceReview(input: PerformanceReviewInput) {
  const response = await apiClient.post<PerformanceReview>('/performance-reviews/', input)
  return response.data
}

// -- Payroll ------------------------------------------------------------------------

export async function fetchPayrollRecords(params: { employee?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<PayrollRecord>>('/payroll-records/', { params })
  return response.data
}

export async function createPayrollRecord(input: PayrollRecordInput) {
  const response = await apiClient.post<PayrollRecord>('/payroll-records/', input)
  return response.data
}

export async function processPayrollRecord(id: string) {
  const response = await apiClient.post<PayrollRecord>(`/payroll-records/${id}/process/`)
  return response.data
}

export async function markPayrollRecordPaid(id: string) {
  const response = await apiClient.post<PayrollRecord>(`/payroll-records/${id}/mark_paid/`)
  return response.data
}
