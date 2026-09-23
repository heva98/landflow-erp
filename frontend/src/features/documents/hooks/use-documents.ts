import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createDocument, fetchDocument, fetchDocuments, uploadDocumentVersion } from '../api/documents-api'
import type { CreateDocumentInput, DocumentListParams, UploadVersionInput } from '../types'

export function useDocumentsQuery(params: DocumentListParams = {}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => fetchDocuments(params),
  })
}

export function useDocumentQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => fetchDocument(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateDocumentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocument(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useUploadDocumentVersionMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UploadVersionInput) => uploadDocumentVersion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', id] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
