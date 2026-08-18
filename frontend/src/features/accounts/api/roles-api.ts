import type { Role } from '@/features/auth/types'
import { apiClient } from '@/lib/api-client'

import type { PaginatedResponse } from '../types'

export async function fetchRoles(): Promise<PaginatedResponse<Role>> {
  const response = await apiClient.get<PaginatedResponse<Role>>('/roles/', { params: { page_size: 100 } })
  return response.data
}
