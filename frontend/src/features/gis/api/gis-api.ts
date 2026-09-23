import type { AxiosResponse } from 'axios'

import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, Plot } from '@/features/plots/types'
import type { Project } from '@/features/projects/types'

const MAX_PAGE_SIZE = 200

/** Follows pagination fully — the map needs every plot with coordinates, not just one page. */
async function fetchAllPages<T>(url: string): Promise<T[]> {
  const results: T[] = []
  let next: string | null = `${url}?page_size=${MAX_PAGE_SIZE}`
  while (next) {
    const response: AxiosResponse<PaginatedResponse<T>> = await apiClient.get(next)
    results.push(...response.data.results)
    next = response.data.next
  }
  return results
}

export async function fetchAllPlotsForMap(): Promise<Plot[]> {
  return fetchAllPages<Plot>('/plots/')
}

export async function fetchAllProjectsForMap(): Promise<Project[]> {
  return fetchAllPages<Project>('/projects/')
}

export async function updatePlotBoundary(plotId: string, polygonGeojson: unknown): Promise<Plot> {
  const response = await apiClient.patch<Plot>(`/plots/${plotId}/`, { polygon_geojson: polygonGeojson })
  return response.data
}
