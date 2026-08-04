import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  sublabel?: React.ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'warning'
}

const TONE_CLASS: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-foreground',
  positive: 'text-accent',
  negative: 'text-destructive',
  warning: 'text-warning',
}

export function StatCard({ icon: Icon, label, value, sublabel, tone = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{label}</CardTitle>
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-semibold', TONE_CLASS[tone])}>{value}</div>
        {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  )
}
