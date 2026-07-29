import { apiClient } from '@/lib/api-client'

import type { ProjectOwner } from '../types'

interface PaginatedUsers {
  count: number
  next: string | null
  previous: string | null
  results: ProjectOwner[]
}

export async function fetchUsers(): Promise<ProjectOwner[]> {
  const response = await apiClient.get<PaginatedUsers>('/users/')
  return response.data.results
}
