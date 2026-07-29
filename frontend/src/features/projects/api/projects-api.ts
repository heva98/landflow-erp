import { apiClient } from '@/lib/api-client'

import type { PaginatedResponse, Project, ProjectInput, ProjectListParams } from '../types'

export async function fetchProjects(params: ProjectListParams = {}): Promise<PaginatedResponse<Project>> {
  const response = await apiClient.get<PaginatedResponse<Project>>('/projects/', { params })
  return response.data
}

export async function fetchProject(id: string): Promise<Project> {
  const response = await apiClient.get<Project>(`/projects/${id}/`)
  return response.data
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const response = await apiClient.post<Project>('/projects/', input)
  return response.data
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const response = await apiClient.put<Project>(`/projects/${id}/`, input)
  return response.data
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}/`)
}
