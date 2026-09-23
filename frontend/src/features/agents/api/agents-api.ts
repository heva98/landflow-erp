import { apiClient } from '@/lib/api-client'

import type {
  Agent,
  AgentInput,
  AgentRanking,
  CommissionPayment,
  CommissionPlan,
  CommissionPlanInput,
  CommissionTier,
  CommissionTierInput,
  PaginatedResponse,
  SalesTarget,
  SalesTargetInput,
  Territory,
  TerritoryInput,
} from '../types'

// -- Territories ----------------------------------------------------------------

export async function fetchTerritories(params: { search?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<Territory>>('/territories/', { params })
  return response.data
}

export async function createTerritory(input: TerritoryInput) {
  const response = await apiClient.post<Territory>('/territories/', input)
  return response.data
}

// -- Commission plans -------------------------------------------------------------

export async function fetchCommissionPlans(params: { search?: string; is_active?: boolean } = {}) {
  const response = await apiClient.get<PaginatedResponse<CommissionPlan>>('/commission-plans/', { params })
  return response.data
}

export async function createCommissionPlan(input: CommissionPlanInput) {
  const response = await apiClient.post<CommissionPlan>('/commission-plans/', input)
  return response.data
}

export async function createCommissionTier(input: CommissionTierInput) {
  const response = await apiClient.post<CommissionTier>('/commission-tiers/', input)
  return response.data
}

// -- Agents -----------------------------------------------------------------------

export async function fetchAgents(
  params: { search?: string; employee?: string; territory?: string; is_active?: boolean } = {},
) {
  const response = await apiClient.get<PaginatedResponse<Agent>>('/agents/', { params })
  return response.data
}

export async function fetchAgent(id: string) {
  const response = await apiClient.get<Agent>(`/agents/${id}/`)
  return response.data
}

export async function createAgent(input: AgentInput) {
  const response = await apiClient.post<Agent>('/agents/', input)
  return response.data
}

export async function updateAgent(id: string, input: AgentInput) {
  const response = await apiClient.put<Agent>(`/agents/${id}/`, input)
  return response.data
}

export async function fetchAgentRankings(params: { start_date?: string; end_date?: string } = {}) {
  const response = await apiClient.get<AgentRanking[]>('/agents/rankings/', { params })
  return response.data
}

// -- Sales targets ------------------------------------------------------------------

export async function fetchSalesTargets(params: { agent?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<SalesTarget>>('/sales-targets/', { params })
  return response.data
}

export async function createSalesTarget(input: SalesTargetInput) {
  const response = await apiClient.post<SalesTarget>('/sales-targets/', input)
  return response.data
}

// -- Commission payments ---------------------------------------------------------------

export async function fetchCommissionPayments(params: { agent?: string; status?: string } = {}) {
  const response = await apiClient.get<PaginatedResponse<CommissionPayment>>('/commission-payments/', { params })
  return response.data
}

export async function approveCommissionPayment(id: string) {
  const response = await apiClient.post<CommissionPayment>(`/commission-payments/${id}/approve/`)
  return response.data
}

export async function markCommissionPaymentPaid(id: string, payment_reference?: string) {
  const response = await apiClient.post<CommissionPayment>(`/commission-payments/${id}/mark_paid/`, {
    payment_reference,
  })
  return response.data
}

export async function cancelCommissionPayment(id: string) {
  const response = await apiClient.post<CommissionPayment>(`/commission-payments/${id}/cancel/`)
  return response.data
}
