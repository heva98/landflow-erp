import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import { useCreateNoteMutation, useNotesQuery } from '../hooks/use-notes'
import type { CRMTargetRef, CRMTargetType } from '../types'

interface NotesPanelProps {
  targetType: CRMTargetType
  targetId: string
}

export function NotesPanel({ targetType, targetId }: NotesPanelProps) {
  const [body, setBody] = useState('')
  const { data, isLoading } = useNotesQuery({ target_type: targetType, object_id: targetId })
  const createNote = useCreateNoteMutation()

  async function handleAdd() {
    if (!body.trim()) return
    const targetRef = { [targetType]: targetId } as CRMTargetRef
    await createNote.mutateAsync({ ...targetRef, body })
    setBody('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Add a note…"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
          />
          <div>
            <Button type="button" size="sm" onClick={handleAdd} disabled={createNote.isPending || !body.trim()}>
              {createNote.isPending && <Loader2 className="animate-spin" />}
              Add note
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading notes…</p>}
          {data && data.results.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
          {data?.results.map((note) => (
            <div key={note.id} className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="whitespace-pre-wrap text-foreground">{note.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {note.author_name || 'Unknown'} · {new Date(note.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
