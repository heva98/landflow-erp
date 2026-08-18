import type { VariantProps } from 'class-variance-authority'
import { ArrowRight, CornerDownRight } from 'lucide-react'

import { Badge, type badgeVariants } from '@/components/ui/badge'

type Tone = VariantProps<typeof badgeVariants>['variant']

interface StatusFlowProps {
  steps: { label: string; tone?: Tone }[]
  alt?: { label: string; tone?: Tone }[]
  altLabel?: string
}

export function StatusFlow({ steps, alt, altLabel = 'Can also end in' }: StatusFlowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1.5">
            <Badge variant={step.tone ?? 'outline'} className="px-2.5 py-1 text-[0.75rem]">
              {step.label}
            </Badge>
            {i < steps.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/60" />}
          </div>
        ))}
      </div>
      {alt && alt.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground">{altLabel}:</span>
          {alt.map((step) => (
            <Badge key={step.label} variant={step.tone ?? 'destructive'} className="px-2.5 py-1 text-[0.75rem]">
              {step.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
