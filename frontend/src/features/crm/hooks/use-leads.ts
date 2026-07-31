import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  convertLead,
  createLead,
  deleteLead,
  fetchLead,
  fetchLeads,
  updateLead,
  updateLeadStatus,
} from '../api/crm-api'
import type { LeadInput, LeadListParams, LeadStatus } from '../types'

export function useLeadsQuery(params: LeadListParams = {}) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
  })
}

export function useLeadQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => fetchLead(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLeadMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LeadInput) => updateLead(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useUpdateLeadStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}

export function useConvertLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: convertLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useDeleteLeadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    },
  })
}
