import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTZS } from '@/lib/utils'

import type { MonthlySalesPoint } from '../types'

function compactTZS(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`
  return String(value)
}

interface TooltipPayloadEntry {
  payload: { label: string; total: number; count: number }
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{point.label}</p>
      <p className="mt-1 text-muted-foreground">
        {point.count} sale{point.count === 1 ? '' : 's'} · {formatTZS(point.total)}
      </p>
    </div>
  )
}

export function MonthlySalesChart({ data }: { data: MonthlySalesPoint[] }) {
  const chartData = data.map((point) => ({ ...point, total: Number(point.total) }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
        <CardDescription>Value of active sales closed per month, last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                tickFormatter={compactTZS}
                width={48}
              />
              <Tooltip cursor={{ fill: 'var(--color-muted)' }} content={<ChartTooltip />} />
              <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
