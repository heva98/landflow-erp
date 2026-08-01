import {
  Building2,
  CalendarClock,
  ClipboardList,
  Contact,
  LandPlot,
  LayoutDashboard,
  Map,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  path?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Projects', icon: Building2, path: '/projects' },
  { label: 'Plots', icon: LandPlot, path: '/plots' },
  { label: 'Survey', icon: Map },
  { label: 'Reservations', icon: CalendarClock, path: '/reservations' },
  { label: 'Leads', icon: Contact, path: '/crm/leads' },
  { label: 'Customers', icon: Users, path: '/crm/customers' },
  { label: 'Sales', icon: Receipt, path: '/sales' },
  { label: 'Installments', icon: Wallet },
  { label: 'Reports', icon: ClipboardList },
]

export function Sidebar() {
  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-6 text-lg font-semibold">LandFlow ERP</div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ label, icon: Icon, path }) =>
          path ? (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ) : (
            <span
              key={label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/40"
            >
              <Icon className="size-4" />
              {label}
            </span>
          ),
        )}
      </nav>
    </aside>
  )
}
