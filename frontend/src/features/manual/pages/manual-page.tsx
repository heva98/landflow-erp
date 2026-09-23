import {
  BookOpen,
  Bus,
  CalendarClock,
  Contact,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  LogIn,
  Receipt,
  Scale,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import { ActionList, FieldList, ManualSection, Tip } from '../components/manual-section'
import { JourneyMap } from '../components/journey-map'
import { StatusFlow } from '../components/status-flow'
import { MANUAL_CATEGORIES } from '../data/manual-modules'

const EXAMPLE_ROLES = [
  'Administrator',
  'Managing Director',
  'Finance Manager',
  'Sales Manager',
  'Sales Agent',
  'Surveyor',
  'Legal Officer',
  'CRM Officer',
  'Receptionist',
  'Marketing Officer',
  'Cashier',
  'Accountant',
  'Document Officer',
  'Site Manager',
  'Auditor',
]

const FAQ = [
  {
    q: "I can't see a menu item or dashboard widget that a colleague has.",
    a: 'Nearly everything in LandFlow — sidebar links, dashboard widgets, report tabs, even individual buttons — is gated by permission. If something is missing, it\'s a role configuration matter, not a bug. Ask an administrator to grant the relevant permission on your role.',
  },
  {
    q: 'Login says "Incorrect email or password."',
    a: 'Double-check for typos or Caps Lock. There is no self-service password reset — if it keeps failing, ask an administrator to reset your password.',
  },
  {
    q: "A plot won't let me reserve or sell it.",
    a: 'Only plots with status Available can be reserved or sold. Check the status badge on the Plots list, the plot\'s detail page, or the GIS map.',
  },
  {
    q: 'Where do I get an invoice or receipt as a PDF?',
    a: 'Open the sale from the Sales module. The Invoice card and each row of the Receipts table have a "View PDF" link.',
  },
  {
    q: "A subdivision is approved but the plots still aren't for sale.",
    a: 'Approving a subdivision doesn\'t create plots by itself. Open the subdivision and click "Convert to plot" on each planned parcel you want to make sellable.',
  },
  {
    q: 'A reservation I made has disappeared.',
    a: 'It reached its expiry date and was automatically released — the plot returns to Available on its own, no manual cleanup needed.',
  },
  {
    q: 'How are agent commissions calculated?',
    a: 'From the commission plan assigned to the agent under Agents → Commission Settings — Percentage, Flat, or Tiered by sale amount. Payments then move Pending → Approved → Paid under Commission Payments.',
  },
]

function TocLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <a href={`#${id}`} className="block rounded-md px-2 py-1 text-foreground/80 hover:bg-muted hover:text-foreground">
      {children}
    </a>
  )
}

export function ManualPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 pb-20">
      <div className="flex flex-col gap-3 rounded-2xl bg-secondary px-8 py-10 text-secondary-foreground">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          <BookOpen className="size-3.5" />
          User Manual
        </span>
        <h1 className="text-3xl font-semibold">LandFlow ERP — how the system works</h1>
        <p className="max-w-2xl text-sm text-secondary-foreground/80">
          A guided reference for every module: what it's for, the fields and statuses you'll see, and the
          actions available to you. Use the contents on the left to jump straight to a module, or read top
          to bottom for the full picture.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-6 flex max-h-[calc(100svh-3rem)] flex-col gap-4 overflow-y-auto pr-2 text-sm">
            <div>
              <TocLink id="journey">The customer journey</TocLink>
              <TocLink id="getting-started">Getting started</TocLink>
              <TocLink id="dashboard">Dashboard</TocLink>
            </div>
            {MANUAL_CATEGORIES.map((category) => (
              <div key={category.id}>
                <span className="block px-2 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {category.title}
                </span>
                {category.modules.map((mod) => (
                  <TocLink key={mod.id} id={mod.id}>
                    {mod.title}
                  </TocLink>
                ))}
              </div>
            ))}
            <div>
              <TocLink id="roles">Roles &amp; permissions</TocLink>
              <TocLink id="faq">FAQ &amp; troubleshooting</TocLink>
            </div>
          </nav>
        </aside>

        <div className="flex flex-col gap-14">
          <section id="journey" className="flex scroll-mt-6 flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">The customer journey, end to end</h2>
              <p className="text-sm text-muted-foreground">
                Most modules exist to move a prospect through this pipeline. Click any stage to open it.
              </p>
            </div>
            <Card>
              <CardContent className="overflow-x-auto py-2">
                <JourneyMap
                  steps={[
                    { icon: Contact, label: 'Lead', path: '/crm/leads' },
                    { icon: Bus, label: 'Site Visit', path: '/site-visits' },
                    { icon: CalendarClock, label: 'Reservation', path: '/reservations' },
                    { icon: Receipt, label: 'Sale', path: '/sales' },
                    { icon: Wallet, label: 'Installments', path: '/installments' },
                    { icon: Scale, label: 'Ownership Transfer', path: '/legal' },
                  ]}
                />
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              Not every sale takes every step — a cash buyer can skip straight from Lead to Sale — but the
              modules are built to hand off to one another in this order.
            </p>
          </section>

          <section id="getting-started" className="flex scroll-mt-6 flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LogIn className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Getting started</h2>
                <p className="text-sm text-muted-foreground">Signing in, the layout, and how access is controlled.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <KeyRound className="size-4 text-primary" />
                    Signing in
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sign in with your email and password at the login screen. There is no self-service
                    account creation or password reset — an administrator sets up your account and role.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LayoutDashboard className="size-4 text-primary" />
                    The layout
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The sidebar on the left lists every module you have access to. The top bar shows your
                    role on the left and your account (with sign-out) on the right.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card id="roles" className="scroll-mt-6">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  Roles &amp; permissions
                </div>
                <p className="text-sm text-muted-foreground">
                  Every user has one role, and every role carries its own set of permissions. A role can also
                  be marked <span className="font-medium text-foreground">full access</span> (bypasses all
                  checks — typically Administrator) or{' '}
                  <span className="font-medium text-foreground">read-only</span> (can view everything, change
                  nothing — typically Auditor). For everyone else, what you see is exactly what your role
                  grants: sidebar links, dashboard widgets, report tabs, and action buttons all disappear on
                  their own when a permission is missing — that's expected behaviour, not an error.
                </p>
                <p className="text-sm text-muted-foreground">
                  Roles and their permissions are fully configurable by an administrator. Common starting
                  points look like this:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_ROLES.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <ManualSection id="dashboard" icon={LayoutDashboard} title="Dashboard" path="/dashboard"
            description="Your landing page after signing in — a live operational snapshot.">
            <p className="text-sm text-muted-foreground">
              Every widget is shown only if your role can see the data behind it, so two people can land on
              very different dashboards.
            </p>
            <FieldList
              label="What you may see"
              items={[
                'Revenue today / this month',
                'Plot counts by status',
                'New leads',
                'Pending ownership transfers',
                'Outstanding balances',
                'Monthly sales chart',
                'Top sales agents',
                'Upcoming installment payments',
                'Recent activity feed',
              ]}
            />
            <p className="text-sm text-muted-foreground">
              The recent activity feed is pulled from the system's audit log — every create, update, and
              status change is tracked there.
            </p>
          </ManualSection>

          {MANUAL_CATEGORIES.map((category) => (
            <div key={category.id} className="flex flex-col gap-10 border-t border-border pt-10">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              {category.modules.map((mod) => (
                <ManualSection key={mod.id} id={mod.id} icon={mod.icon} title={mod.title} path={mod.path} description={mod.purpose}>
                  {mod.keyFields && <FieldList label="Key fields" items={mod.keyFields} />}
                  {mod.flow && <StatusFlow steps={mod.flow} alt={mod.altFlow} altLabel={mod.altFlowLabel} />}
                  <ActionList label="What you can do" items={mod.actions} />
                  {mod.tip && <Tip>{mod.tip}</Tip>}
                </ManualSection>
              ))}
            </div>
          ))}

          <section id="faq" className="flex scroll-mt-6 flex-col gap-4 border-t border-border pt-10">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">FAQ &amp; troubleshooting</h2>
                <p className="text-sm text-muted-foreground">The questions that come up most often.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {FAQ.map((item) => (
                <Card key={item.q}>
                  <CardContent className="flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{item.q}</p>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Still stuck? Reach out to your system administrator — most access issues are a one-line
              permission change on your role, and most data issues are best diagnosed together on the
              relevant record (have its reference number or link ready).
            </p>
          </section>

          <p className="text-center text-xs text-muted-foreground">
            Looking for a module that isn't listed here?{' '}
            <Link to="/dashboard" className="text-primary hover:underline">
              Return to the dashboard
            </Link>{' '}
            and check the sidebar — access depends on your role.
          </p>
        </div>
      </div>
    </div>
  )
}
