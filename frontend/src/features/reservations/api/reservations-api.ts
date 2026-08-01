import { apiClient } from '@/lib/api-client'

import type { PaginatedResponse, Reservation, ReservationInput, ReservationListParams } from '../types'

export async function fetchReservations(params: ReservationListParams = {}): Promise<PaginatedResponse<Reservation>> {
  const response = await apiClient.get<PaginatedResponse<Reservation>>('/reservations/', { params })
  return response.data
}

export async function fetchReservation(id: string): Promise<Reservation> {
  const response = await apiClient.get<Reservation>(`/reservations/${id}/`)
  return response.data
}

export async function createReservation(input: ReservationInput): Promise<Reservation> {
  const response = await apiClient.post<Reservation>('/reservations/', input)
  return response.data
}

export async function cancelReservation(id: string): Promise<Reservation> {
  const response = await apiClient.post<Reservation>(`/reservations/${id}/cancel/`)
  return response.data
}
