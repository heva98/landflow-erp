import type { User } from '@/features/auth/types'
import { apiClient } from '@/lib/api-client'

import type { PaginatedResponse, UserInput, UserListParams } from '../types'

export async function fetchUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<PaginatedResponse<User>>('/users/', { params })
  return response.data
}

export async function createUser(input: UserInput) {
  const response = await apiClient.post<User>('/users/', input)
  return response.data
}

export async function updateUser(id: string, input: Partial<UserInput>) {
  const response = await apiClient.patch<User>(`/users/${id}/`, input)
  return response.data
}
