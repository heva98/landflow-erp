export type { Role, User } from '@/features/auth/types'

export interface UserListParams {
  is_active?: boolean
  role?: string
  search?: string
  page?: number
  page_size?: number
}

export interface UserInput {
  email: string
  first_name?: string
  last_name?: string
  role_id?: string | null
  password?: string
  is_active?: boolean
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
