export type { Role, User } from '@/features/auth/types'

export interface UserListParams {
  is_active?: boolean
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
