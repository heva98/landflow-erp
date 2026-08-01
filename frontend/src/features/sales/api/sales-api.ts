import { apiClient } from '@/lib/api-client'

import type { PaginatedResponse, Sale, SaleInput, SaleListParams } from '../types'

export async function fetchSales(params: SaleListParams = {}): Promise<PaginatedResponse<Sale>> {
  const response = await apiClient.get<PaginatedResponse<Sale>>('/sales/', { params })
  return response.data
}

export async function fetchSale(id: string): Promise<Sale> {
  const response = await apiClient.get<Sale>(`/sales/${id}/`)
  return response.data
}

export async function createSale(input: SaleInput): Promise<Sale> {
  const response = await apiClient.post<Sale>('/sales/', input)
  return response.data
}

export async function cancelSale(id: string): Promise<Sale> {
  const response = await apiClient.post<Sale>(`/sales/${id}/cancel/`)
  return response.data
}
