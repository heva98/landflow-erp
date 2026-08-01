import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { cancelReservation, createReservation, fetchReservation, fetchReservations } from '../api/reservations-api'
import type { ReservationListParams } from '../types'

export function useReservationsQuery(params: ReservationListParams = {}) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => fetchReservations(params),
  })
}

export function useReservationQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['reservations', id],
    queryFn: () => fetchReservation(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateReservationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
  })
}

export function useCancelReservationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
  })
}
