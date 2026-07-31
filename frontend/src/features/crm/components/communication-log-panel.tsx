import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCommunicationsQuery, useCreateCommunicationMutation } from '../hooks/use-communications'
import {
  COMMUNICATION_CHANNEL_LABELS,
  COMMUNICATION_CHANNELS,
  COMMUNICATION_DIRECTION_LABELS,
  COMMUNICATION_DIRECTIONS,
  type CommunicationChannel,
  type CommunicationDirection,
  type CRMTargetRef,
  type CRMTargetType,
} from '../types'

interface CommunicationLogPanelProps {
  targetType: CRMTargetType
  targetId: string
}

export function CommunicationLogPanel({ targetType, targetId }: CommunicationLogPanelProps) {
  const [channel, setChannel] = useState<CommunicationChannel>('call')
  const [direction, setDirection] = useState<CommunicationDirection>('outbound')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const { data, isLoading } = useCommunicationsQuery({ target_type: targetType, object_id: targetId })
  const createCommunication = useCreateCommunicationMutation()

  async function handleAdd() {
    if (!subject.trim() && !body.trim()) return
    const targetRef = { [targetType]: targetId } as CRMTargetRef
    await createCommunication.mutateAsync({ ...targetRef, channel, direction, subject, body })
    setSubject('')
    setBody('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication log</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Select value={channel} onValueChange={(value) => setChannel(value as CommunicationChannel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_CHANNELS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {COMMUNICATION_CHANNEL_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={direction} onValueChange={(value) => setDirection(value as CommunicationDirection)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_DIRECTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {COMMUNICATION_DIRECTION_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Subject (optional)"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
          <Textarea
            placeholder="What was discussed…"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
          />
          <div>
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={createCommunication.isPending || (!subject.trim() && !body.trim())}
            >
              {createCommunication.isPending && <Loader2 className="animate-spin" />}
              Log entry
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading communications…</p>}
          {data && data.results.length === 0 && (
            <p className="text-sm text-muted-foreground">No communications logged yet.</p>
          )}
          {data?.results.map((entry) => (
            <div key={entry.id} className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground">
                {COMMUNICATION_CHANNEL_LABELS[entry.channel]} · {COMMUNICATION_DIRECTION_LABELS[entry.direction]}
                {entry.subject && ` — ${entry.subject}`}
              </p>
              {entry.body && <p className="mt-1 whitespace-pre-wrap text-foreground">{entry.body}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {entry.logged_by_name || 'Unknown'} · {new Date(entry.occurred_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
