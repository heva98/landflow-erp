import { apiClient } from '@/lib/api-client'

import type {
  ActivityLog, ApprovalStep, ApprovalStepInput, ApprovalWorkflow, ApprovalWorkflowInput, AuditLog, Currency,
  CurrencyInput, Location, LocationInput, PaginatedResponse, SystemSetting, SystemSettingInput,
} from '../types'

// -- Currencies ------------------------------------------------------------------

export async function fetchCurrencies(params: { search?: string; is_active?: boolean } = {}) {
  const response = await apiClient.get<PaginatedResponse<Currency>>('/currencies/', { params })
  return response.data
}

export async function createCurrency(input: CurrencyInput) {
  const response = await apiClient.post<Currency>('/currencies/', input)
  return response.data
}

export async function updateCurrency(id: string, input: CurrencyInput) {
  const response = await apiClient.put<Currency>(`/currencies/${id}/`, input)
  return response.data
}

// -- Locations ---------------------------------------------------------------------

export async function fetchLocations(
  params: { search?: string; location_type?: string; parent?: string } = {},
) {
  const response = await apiClient.get<PaginatedResponse<Location>>('/locations/', { params: { page_size: 200, ...params } })
  return response.data
}

export async function createLocation(input: LocationInput) {
  const response = await apiClient.post<Location>('/locations/', input)
  return response.data
}

export async function updateLocation(id: string, input: LocationInput) {
  const response = await apiClient.put<Location>(`/locations/${id}/`, input)
  return response.data
}

// -- Settings -------------------------------------------------------------------------

export async function fetchSettings() {
  const response = await apiClient.get<SystemSetting>('/settings/')
  return response.data
}

export async function updateSettings(input: SystemSettingInput) {
  const response = await apiClient.patch<SystemSetting>('/settings/', input)
  return response.data
}

// -- Approval workflows -----------------------------------------------------------------

export async function fetchApprovalWorkflows(params: { search?: string; workflow_type?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<ApprovalWorkflow>>('/approval-workflows/', { params })
  return response.data
}

export async function createApprovalWorkflow(input: ApprovalWorkflowInput) {
  const response = await apiClient.post<ApprovalWorkflow>('/approval-workflows/', input)
  return response.data
}

export async function updateApprovalWorkflow(id: string, input: ApprovalWorkflowInput) {
  const response = await apiClient.put<ApprovalWorkflow>(`/approval-workflows/${id}/`, input)
  return response.data
}

export async function createApprovalStep(input: ApprovalStepInput) {
  const response = await apiClient.post<ApprovalStep>('/approval-steps/', input)
  return response.data
}

export async function deleteApprovalStep(id: string) {
  await apiClient.delete(`/approval-steps/${id}/`)
}

// -- Audit log ----------------------------------------------------------------------------

export async function fetchAuditLogs(
  params: {
    search?: string
    action?: string
    content_type?: string
    actor?: string
    date_from?: string
    date_to?: string
    page?: number
  } = {},
) {
  const response = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-logs/', { params })
  return response.data
}

// -- Activity log -------------------------------------------------------------------------

export async function fetchActivityLogs(
  params: { action?: string; actor?: string; date_from?: string; date_to?: string; page?: number } = {},
) {
  const response = await apiClient.get<PaginatedResponse<ActivityLog>>('/activity-logs/', { params })
  return response.data
}
