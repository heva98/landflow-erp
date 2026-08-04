import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTZS } from '@/lib/utils'

import type { TopAgent } from '../types'

export function TopAgentsCard({ agents }: { agents: TopAgent[] }) {
  const maxTotal = Math.max(1, ...agents.map((agent) => Number(agent.total)))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Sales Agents</CardTitle>
        <CardDescription>Ranked by sales value this month</CardDescription>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales recorded this month yet.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {agents.map((agent, index) => {
              const total = Number(agent.total)
              const widthPct = Math.max(4, Math.round((total / maxTotal) * 100))
              return (
                <li key={agent.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                      {agent.name}
                    </span>
                    <span className="text-muted-foreground">
                      {agent.deals} deal{agent.deals === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${widthPct}%` }} />
                    </div>
                    <span className="w-28 shrink-0 text-right text-sm font-medium text-foreground">
                      {formatTZS(agent.total)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
