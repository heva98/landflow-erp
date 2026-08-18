import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createApprovalStep, createApprovalWorkflow, createCurrency, createLocation, deleteApprovalStep,
  fetchActivityLogs, fetchApprovalWorkflows, fetchAuditLogs, fetchCurrencies, fetchLocations, fetchSettings,
  updateApprovalWorkflow, updateCurrency, updateLocation, updateSettings,
} from '../api/administration-api'
import type {
  ApprovalStepInput, ApprovalWorkflowInput, CurrencyInput, LocationInput, SystemSettingInput,
} from '../types'

// -- Currencies ------------------------------------------------------------------

export function useCurrenciesQuery(params: { search?: string; is_active?: boolean } = {}) {
  return useQuery({ queryKey: ['currencies', params], queryFn: () => fetchCurrencies(params) })
}

export function useCreateCurrencyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CurrencyInput) => createCurrency(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currencies'] }),
  })
}

export function useUpdateCurrencyMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CurrencyInput) => updateCurrency(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currencies'] }),
  })
}

// -- Locations ---------------------------------------------------------------------

export function useLocationsQuery(params: { search?: string; location_type?: string; parent?: string } = {}) {
  return useQuery({ queryKey: ['locations', params], queryFn: () => fetchLocations(params) })
}

export function useCreateLocationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LocationInput) => createLocation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  })
}

export function useUpdateLocationMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LocationInput) => updateLocation(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  })
}

// -- Settings -------------------------------------------------------------------------

export function useSettingsQuery() {
  return useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SystemSettingInput) => updateSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })
}

// -- Approval workflows -----------------------------------------------------------------

export function useApprovalWorkflowsQuery(params: { search?: string; workflow_type?: string } = {}) {
  return useQuery({ queryKey: ['approval-workflows', params], queryFn: () => fetchApprovalWorkflows(params) })
}

export function useCreateApprovalWorkflowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ApprovalWorkflowInput) => createApprovalWorkflow(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-workflows'] }),
  })
}

export function useUpdateApprovalWorkflowMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ApprovalWorkflowInput) => updateApprovalWorkflow(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-workflows'] }),
  })
}

export function useCreateApprovalStepMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ApprovalStepInput) => createApprovalStep(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-workflows'] }),
  })
}

export function useDeleteApprovalStepMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteApprovalStep(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-workflows'] }),
  })
}

// -- Audit log ----------------------------------------------------------------------------

export function useAuditLogsQuery(
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
  return useQuery({ queryKey: ['audit-logs', params], queryFn: () => fetchAuditLogs(params) })
}

// -- Activity log -------------------------------------------------------------------------

export function useActivityLogsQuery(
  params: { action?: string; actor?: string; date_from?: string; date_to?: string; page?: number } = {},
) {
  return useQuery({ queryKey: ['activity-logs', params], queryFn: () => fetchActivityLogs(params) })
}
