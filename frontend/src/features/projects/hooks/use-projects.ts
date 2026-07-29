import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createProject, deleteProject, fetchProject, fetchProjects, updateProject } from '../api/projects-api'
import type { ProjectInput, ProjectListParams } from '../types'

export function useProjectsQuery(params: ProjectListParams = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => fetchProjects(params),
  })
}

export function useProjectQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchProject(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProjectMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInput) => updateProject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
