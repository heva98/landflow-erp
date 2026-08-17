import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveCommissionPayment,
  cancelCommissionPayment,
  createAgent,
  createCommissionPlan,
  createCommissionTier,
  createSalesTarget,
  createTerritory,
  fetchAgent,
  fetchAgentRankings,
  fetchAgents,
  fetchCommissionPayments,
  fetchCommissionPlans,
  fetchSalesTargets,
  fetchTerritories,
  markCommissionPaymentPaid,
  updateAgent,
} from '../api/agents-api'
import type {
  AgentInput,
  CommissionPlanInput,
  CommissionTierInput,
  SalesTargetInput,
  TerritoryInput,
} from '../types'

// -- Territories ----------------------------------------------------------------

export function useTerritoriesQuery(params: { search?: string } = {}) {
  return useQuery({ queryKey: ['territories', params], queryFn: () => fetchTerritories(params) })
}

export function useCreateTerritoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TerritoryInput) => createTerritory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['territories'] }),
  })
}

// -- Commission plans -------------------------------------------------------------

export function useCommissionPlansQuery(params: { search?: string; is_active?: boolean } = {}) {
  return useQuery({ queryKey: ['commission-plans', params], queryFn: () => fetchCommissionPlans(params) })
}

export function useCreateCommissionPlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CommissionPlanInput) => createCommissionPlan(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission-plans'] }),
  })
}

export function useCreateCommissionTierMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CommissionTierInput) => createCommissionTier(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission-plans'] }),
  })
}

// -- Agents -----------------------------------------------------------------------

export function useAgentsQuery(
  params: { search?: string; employee?: string; territory?: string; is_active?: boolean } = {},
) {
  return useQuery({ queryKey: ['agents', params], queryFn: () => fetchAgents(params) })
}

export function useAgentQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => fetchAgent(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateAgentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AgentInput) => createAgent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useUpdateAgentMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AgentInput) => updateAgent(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', id] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

export function useAgentRankingsQuery(params: { start_date?: string; end_date?: string } = {}) {
  return useQuery({ queryKey: ['agent-rankings', params], queryFn: () => fetchAgentRankings(params) })
}

// -- Sales targets ------------------------------------------------------------------

export function useSalesTargetsQuery(params: { agent?: string } = {}) {
  return useQuery({ queryKey: ['sales-targets', params], queryFn: () => fetchSalesTargets(params) })
}

export function useCreateSalesTargetMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SalesTargetInput) => createSalesTarget(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-targets'] }),
  })
}

// -- Commission payments ---------------------------------------------------------------

export function useCommissionPaymentsQuery(params: { agent?: string; status?: string } = {}) {
  return useQuery({ queryKey: ['commission-payments', params], queryFn: () => fetchCommissionPayments(params) })
}

export function useApproveCommissionPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approveCommissionPayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission-payments'] }),
  })
}

export function useMarkCommissionPaymentPaidMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payment_reference }: { id: string; payment_reference?: string }) =>
      markCommissionPaymentPaid(id, payment_reference),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission-payments'] }),
  })
}

export function useCancelCommissionPaymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelCommissionPayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission-payments'] }),
  })
}
