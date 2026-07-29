import { apiClient } from '@/lib/api-client'

import type { PaginatedResponse, Plot, PlotInput, PlotListParams } from '../types'

export async function fetchPlots(params: PlotListParams = {}): Promise<PaginatedResponse<Plot>> {
  const response = await apiClient.get<PaginatedResponse<Plot>>('/plots/', { params })
  return response.data
}

export async function fetchPlot(id: string): Promise<Plot> {
  const response = await apiClient.get<Plot>(`/plots/${id}/`)
  return response.data
}

export async function createPlot(input: PlotInput): Promise<Plot> {
  const response = await apiClient.post<Plot>('/plots/', input)
  return response.data
}

export async function updatePlot(id: string, input: PlotInput): Promise<Plot> {
  const response = await apiClient.put<Plot>(`/plots/${id}/`, input)
  return response.data
}

export async function deletePlot(id: string): Promise<void> {
  await apiClient.delete(`/plots/${id}/`)
}
