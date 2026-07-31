import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createNote, fetchNotes } from '../api/crm-api'
import type { NoteInput, NoteListParams } from '../types'

export function useNotesQuery(params: NoteListParams) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => fetchNotes(params),
    enabled: Boolean(params.object_id),
  })
}

export function useCreateNoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NoteInput) => createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
