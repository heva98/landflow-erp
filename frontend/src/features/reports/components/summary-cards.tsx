import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SummaryCardItem {
  label: string
  value: React.ReactNode
  tone?: 'default' | 'positive' | 'negative'
}

export function SummaryCardsRow({ items }: { items: SummaryCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle>{item.label}</CardTitle>
          </CardHeader>
          <CardContent
            className={cn(
              'text-xl font-semibold',
              item.tone === 'positive' && 'text-accent',
              item.tone === 'negative' && 'text-destructive',
              (!item.tone || item.tone === 'default') && 'text-foreground',
            )}
          >
            {item.value}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
