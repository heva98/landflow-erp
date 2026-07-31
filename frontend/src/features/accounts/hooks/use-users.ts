import { useQuery } from '@tanstack/react-query'

import { fetchUsers } from '../api/users-api'
import type { UserListParams } from '../types'

export function useUsersQuery(params: UserListParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
    retry: false,
  })
}
