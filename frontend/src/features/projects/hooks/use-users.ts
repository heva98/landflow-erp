import { useQuery } from '@tanstack/react-query'

import { fetchUsers } from '../api/users-api'

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users', 'owner-options'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
