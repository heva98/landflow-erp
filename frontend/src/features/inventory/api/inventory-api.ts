import { apiClient } from '@/lib/api-client'

import type {
  AvailableAreaReport,
  FutureProjectsReport,
  InventoryOverview,
  InventoryParams,
  InventoryPlotReport,
} from '../types'

export async function fetchUnsoldPlots(params: InventoryParams = {}) {
  const response = await apiClient.get<InventoryPlotReport>('/inventory/unsold/', { params })
  return response.data
}

export async function fetchReservedPlots(params: InventoryParams = {}) {
  const response = await apiClient.get<InventoryPlotReport>('/inventory/reserved/', { params })
  return response.data
}

export async function fetchTransferredPlots(params: InventoryParams = {}) {
  const response = await apiClient.get<InventoryPlotReport>('/inventory/transferred/', { params })
  return response.data
}

export async function fetchAvailableArea(params: InventoryParams = {}) {
  const response = await apiClient.get<AvailableAreaReport>('/inventory/available-area/', { params })
  return response.data
}

export async function fetchFutureProjects() {
  const response = await apiClient.get<FutureProjectsReport>('/inventory/future-projects/')
  return response.data
}

export async function fetchInventoryOverview() {
  const response = await apiClient.get<InventoryOverview>('/inventory/overview/')
  return response.data
}
