import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { User } from '@/features/auth/types'

import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from '../types'

interface LeadBulkActionBarProps {
  selectedCount: number
  agents: User[]
  onMoveStage: (status: LeadStatus) => void
  onAssign: (userId: string) => void
  onClear: () => void
}

export function LeadBulkActionBar({ selectedCount, agents, onMoveStage, onAssign, onClear }: LeadBulkActionBarProps) {
  const [stage, setStage] = useState<string>('')
  const [agent, setAgent] = useState<string>('')

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-background shadow-lg">
      <span className="text-sm font-medium">{selectedCount} selected</span>

      <Select
        value={stage}
        onValueChange={(value) => {
          setStage(value)
          onMoveStage(value as LeadStatus)
          setStage('')
        }}
      >
        <SelectTrigger className="h-8 w-36 border-transparent bg-background/10 text-background">
          <SelectValue placeholder="Move to…" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {LEAD_STATUS_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={agent}
        onValueChange={(value) => {
          setAgent(value)
          onAssign(value)
          setAgent('')
        }}
      >
        <SelectTrigger className="h-8 w-36 border-transparent bg-background/10 text-background">
          <SelectValue placeholder="Assign to…" />
        </SelectTrigger>
        <SelectContent>
          {agents.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}`.trim() : user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="ghost" size="sm" className="text-background hover:bg-background/10" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}
