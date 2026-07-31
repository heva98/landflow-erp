// Small presentation helpers shared by the Kanban card and bulk-select UI —
// pure functions so they're easy to reason about outside of React.

export function daysSince(dateIso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateIso).getTime()) / 86_400_000))
}

export function ageBadgeVariant(days: number): 'success' | 'warning' | 'destructive' {
  if (days <= 1) return 'success'
  if (days <= 4) return 'warning'
  return 'destructive'
}

export function ageLabel(days: number): string {
  return days === 0 ? 'Today' : `${days}d`
}

// A handful of brand-consistent colors to hash an assignee's name against,
// so the same person always gets the same avatar color across the board.
const AVATAR_COLORS = ['#0E5B45', '#2563EB', '#C89B3C', '#4CAF50', '#6D28D9', '#B8860B']

export function avatarColor(name: string | null | undefined): string {
  if (!name) return '#CBD5E1'
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export function initialsOf(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
