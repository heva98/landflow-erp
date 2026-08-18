import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createUser, fetchUsers, updateUser } from '../api/users-api'
import type { UserInput, UserListParams } from '../types'

export function useUsersQuery(params: UserListParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
    retry: false,
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => createUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUserMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<UserInput>) => updateUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}
