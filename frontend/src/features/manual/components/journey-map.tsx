import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface JourneyStep {
  icon: LucideIcon
  label: string
  path: string
}

export function JourneyMap({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <Link
            to={step.path}
            className="group flex w-24 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors hover:bg-primary/10"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <step.icon className="size-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{step.label}</span>
          </Link>
          {i < steps.length - 1 && <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />}
        </div>
      ))}
    </div>
  )
}
