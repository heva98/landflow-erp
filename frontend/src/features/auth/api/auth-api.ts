import { apiClient } from '@/lib/api-client'

import type { LoginCredentials, Me, TokenPair } from '../types'

export async function login(credentials: LoginCredentials): Promise<TokenPair> {
  const response = await apiClient.post<TokenPair>('/auth/login/', credentials)
  return response.data
}

export async function fetchMe(): Promise<Me> {
  const response = await apiClient.get<Me>('/me/')
  return response.data
}
