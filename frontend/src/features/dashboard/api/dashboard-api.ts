import { apiClient } from '@/lib/api-client'

import type { DashboardSummary } from '../types'

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>('/reports/dashboard/')
  return response.data
}
