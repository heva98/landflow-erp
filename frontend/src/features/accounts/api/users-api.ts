import type { User } from '@/features/auth/types'
import { apiClient } from '@/lib/api-client'

import type { PaginatedResponse, UserListParams } from '../types'

export async function fetchUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<PaginatedResponse<User>>('/users/', { params })
  return response.data
}
