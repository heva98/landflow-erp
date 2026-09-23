import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ManualSectionProps {
  id: string
  icon: LucideIcon
  title: string
  path?: string
  description?: string
  children: ReactNode
}

export function ManualSection({ id, icon: Icon, title, path, description, children }: ManualSectionProps) {
  return (
    <section id={id} className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {path && (
          <Link
            to={path}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
          >
            Open {title}
            <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export function FieldList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ActionList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground">
            <span className="text-primary">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg bg-info/10 px-3 py-2 text-sm text-info">
      <span className="font-semibold">Tip: </span>
      {children}
    </p>
  )
}
