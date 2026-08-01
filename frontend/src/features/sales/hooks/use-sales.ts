import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { cancelSale, createSale, fetchSale, fetchSales } from '../api/sales-api'
import type { SaleListParams } from '../types'

export function useSalesQuery(params: SaleListParams = {}) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => fetchSales(params),
  })
}

export function useSaleQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => fetchSale(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateSaleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

export function useCancelSaleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
  })
}
