import type { PlotStatus } from '@/features/plots/types'

// Mirrors PlotStatusBadge's variant mapping, using the same CSS custom
// properties so the map stays visually consistent (light and dark) with the
// rest of the app instead of hardcoding a separate palette.
export const PLOT_STATUS_COLORS: Record<PlotStatus, string> = {
  available: 'var(--color-accent)',
  reserved: 'var(--color-warning)',
  sold: 'var(--color-info)',
  transferred: 'var(--color-secondary)',
  cancelled: 'var(--color-destructive)',
}
