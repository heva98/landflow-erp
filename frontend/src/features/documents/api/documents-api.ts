import { apiClient } from '@/lib/api-client'

import type { CreateDocumentInput, Document, DocumentListParams, PaginatedResponse, UploadVersionInput } from '../types'

export async function fetchDocuments(params: DocumentListParams = {}): Promise<PaginatedResponse<Document>> {
  const response = await apiClient.get<PaginatedResponse<Document>>('/documents/', { params })
  return response.data
}

export async function fetchDocument(id: string): Promise<Document> {
  const response = await apiClient.get<Document>(`/documents/${id}/`)
  return response.data
}

export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('document_type', input.document_type)
  formData.append('description', input.description ?? '')
  formData.append('category', input.category ?? '')
  if (input.content_type) formData.append('content_type', input.content_type)
  if (input.object_id) formData.append('object_id', input.object_id)
  formData.append('file', input.file)
  if (input.version_notes) formData.append('version_notes', input.version_notes)

  const response = await apiClient.post<Document>('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function uploadDocumentVersion(id: string, input: UploadVersionInput): Promise<Document> {
  const formData = new FormData()
  formData.append('file', input.file)
  if (input.notes) formData.append('notes', input.notes)

  const response = await apiClient.post<Document>(`/documents/${id}/upload_version/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
