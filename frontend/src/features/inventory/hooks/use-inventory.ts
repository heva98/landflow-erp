import { useQuery } from '@tanstack/react-query'

import {
  fetchAvailableArea,
  fetchFutureProjects,
  fetchInventoryOverview,
  fetchReservedPlots,
  fetchTransferredPlots,
  fetchUnsoldPlots,
} from '../api/inventory-api'
import type { InventoryParams } from '../types'

export function useUnsoldPlotsQuery(params: InventoryParams = {}) {
  return useQuery({ queryKey: ['inventory', 'unsold', params], queryFn: () => fetchUnsoldPlots(params) })
}

export function useReservedPlotsQuery(params: InventoryParams = {}) {
  return useQuery({ queryKey: ['inventory', 'reserved', params], queryFn: () => fetchReservedPlots(params) })
}

export function useTransferredPlotsQuery(params: InventoryParams = {}) {
  return useQuery({ queryKey: ['inventory', 'transferred', params], queryFn: () => fetchTransferredPlots(params) })
}

export function useAvailableAreaQuery(params: InventoryParams = {}) {
  return useQuery({ queryKey: ['inventory', 'available-area', params], queryFn: () => fetchAvailableArea(params) })
}

export function useFutureProjectsQuery() {
  return useQuery({ queryKey: ['inventory', 'future-projects'], queryFn: fetchFutureProjects })
}

export function useInventoryOverviewQuery() {
  return useQuery({ queryKey: ['inventory', 'overview'], queryFn: fetchInventoryOverview })
}
