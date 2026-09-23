import type { VariantProps } from 'class-variance-authority'
import {
  ArrowLeftRight,
  Briefcase,
  Building2,
  Bus,
  CalendarClock,
  CalendarOff,
  ClipboardList,
  Contact,
  FileText,
  Globe,
  Handshake,
  Landmark,
  LandPlot,
  Map,
  PieChart,
  Receipt,
  Scale,
  UserSquare2,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

import type { badgeVariants } from '@/components/ui/badge'

type Tone = VariantProps<typeof badgeVariants>['variant']
type Step = { label: string; tone?: Tone }

export interface ManualModule {
  id: string
  icon: LucideIcon
  title: string
  path: string
  purpose: string
  keyFields?: string[]
  flow?: Step[]
  altFlow?: Step[]
  altFlowLabel?: string
  actions: string[]
  tip?: string
}

export interface ManualCategory {
  id: string
  title: string
  description: string
  modules: ManualModule[]
}

export const MANUAL_CATEGORIES: ManualCategory[] = [
  {
    id: 'land-development',
    title: 'Land & Development',
    description: 'From raw parcel to a subdivided, mappable, sellable project.',
    modules: [
      {
        id: 'acquisitions',
        icon: Handshake,
        title: 'Land Acquisition',
        path: '/acquisitions',
        purpose:
          'Track a land parcel before it becomes a project — owners, negotiations, due diligence, valuation, and purchase costs all live here.',
        keyFields: [
          'Reference number (auto)',
          'Location / Region / District',
          'GPS coordinates',
          'Area (sqm)',
          'Valuation amount & date',
          'Asking price vs. Purchase price',
          'Ownership verified',
          'Legal checks passed',
        ],
        flow: [
          { label: 'Potential' },
          { label: 'Negotiating', tone: 'info' },
          { label: 'Approved', tone: 'warning' },
          { label: 'Purchased', tone: 'success' },
        ],
        altFlow: [{ label: 'Cancelled', tone: 'destructive' }],
        actions: [
          'Add land owner(s) and their ownership percentage',
          'Log negotiations (offered price vs. counter-offer)',
          'Record purchase costs — legal fees, survey fees, agent commission, stamp duty, transfer fees',
          'Upload attachments — title deed, survey map, ID copy, agreement, valuation report',
          'Mark Purchased (locks in the final purchase price) or Cancel (with a reason)',
        ],
        tip: 'Once purchased, link the acquisition to a Project so its land can be planned into plots.',
      },
      {
        id: 'projects',
        icon: Building2,
        title: 'Projects',
        path: '/projects',
        purpose: 'The container for a piece of land under development — plots, media, and financials live inside a project.',
        keyFields: [
          'Name & location',
          'Master plan / map URL',
          'Images & videos',
          'Nearby services',
          'Total area (sqm)',
          'Start / expected completion date',
          'Acquisition, development & expected revenue (financials)',
          'ROI %',
        ],
        flow: [
          { label: 'Planning' },
          { label: 'Development', tone: 'info' },
          { label: 'Selling', tone: 'warning' },
          { label: 'Completed', tone: 'success' },
        ],
        actions: ['Create or edit a project', 'Attach master plan, maps, images, and videos', 'Browse every plot that belongs to the project'],
        tip: 'The financial fields (cost, revenue, ROI) only appear if your role has the project-financials permission — everyone else sees the operational details.',
      },
      {
        id: 'plots',
        icon: LandPlot,
        title: 'Plots',
        path: '/plots',
        purpose: 'The individual sellable unit inside a project — the record that customers, sales, and legal transfers all revolve around.',
        keyFields: [
          'Plot number, block, street',
          'Area (sqm), price, discount, final price',
          'GPS location & polygon boundary',
          'Corner coordinates',
          'Images & 360° images',
          'Nearby schools / roads / hospitals',
          'Current owner',
        ],
        flow: [
          { label: 'Available' },
          { label: 'Reserved', tone: 'warning' },
          { label: 'Sold', tone: 'info' },
          { label: 'Transferred', tone: 'success' },
        ],
        altFlow: [{ label: 'Cancelled', tone: 'destructive' }],
        actions: ['Filter by project, status, or price range', 'Search a specific plot', 'Create or edit plot details'],
        tip: 'You rarely change a plot\'s status by hand — it advances automatically as a Reservation, Sale, and Legal transfer progress.',
      },
      {
        id: 'inventory',
        icon: Warehouse,
        title: 'Inventory',
        path: '/inventory',
        purpose: 'A live, read-only stock view across every project — what\'s left to sell, right now.',
        keyFields: [
          'Overview: Unsold / Reserved / Transferred counts & area',
          'Future projects not yet selling',
          'Available area by project',
        ],
        actions: [
          'Switch tabs: Unsold Plots, Reserved Plots, Transferred Plots',
          'Filter any tab by project',
          'Check Available Area and Future Projects summaries',
        ],
        tip: 'Check this before greenlighting a marketing push — it shows exactly how much sellable area is left per project.',
      },
      {
        id: 'surveys',
        icon: Map,
        title: 'Survey',
        path: '/surveys',
        purpose: 'Formal surveying of a parcel — beacons, road/utility planning, and subdivision into individually sellable plots.',
        keyFields: [
          'Beacon type — concrete pillar, iron pin, wooden peg',
          'Beacon condition — intact, damaged, missing',
          'Survey documents — CAD, GIS, survey map, report',
        ],
        flow: [
          { label: 'Scheduled' },
          { label: 'In progress', tone: 'info' },
          { label: 'Completed', tone: 'warning' },
          { label: 'Approved', tone: 'success' },
        ],
        altFlow: [{ label: 'Rejected', tone: 'destructive' }],
        actions: [
          'Start survey, then Mark completed (enter the area actually surveyed)',
          'Approve or Reject a completed survey (rejection requires a reason)',
          'Subdivide: Draft → Submit for approval → Approve/Reject',
          'Once a subdivision is approved, click Convert to plot on each planned parcel to create a real, sellable Plot',
          'Manage road reserves (main, secondary, access, footpath) and utility reserves (water, electricity, sewer, storm drainage, telecom)',
          'Directory: manage Survey Companies and Surveyors (license #, contact, active status)',
        ],
        tip: 'Nothing becomes an Available plot from a subdivision until you press Convert to plot on that row — approval alone doesn\'t create plots.',
      },
      {
        id: 'gis',
        icon: Globe,
        title: 'GIS Map',
        path: '/gis',
        purpose: 'An interactive map of all projects and plots, colour-coded by status.',
        actions: [
          'Search for a specific plot and fly the map to it',
          'Measure distance between points',
          'Use drawing tools to sketch boundaries',
          'Toggle project and plot layers with the map legend',
        ],
        tip: 'Plot colour follows the status badge you see everywhere else — green-family for Available, so you can scan a whole project at a glance.',
      },
    ],
  },
  {
    id: 'sales-pipeline',
    title: 'Sales Pipeline',
    description: 'From first contact to a signed, paying customer.',
    modules: [
      {
        id: 'site-visits',
        icon: Bus,
        title: 'Site Visits',
        path: '/site-visits',
        purpose: 'Organize prospect trips to a project and track who actually showed up.',
        keyFields: ['Project, visit date, departure time, meeting point', 'Bus (registration + driver), organizer', 'Booking count / checked-in count'],
        flow: [{ label: 'Scheduled' }, { label: 'In progress', tone: 'info' }, { label: 'Completed', tone: 'success' }],
        altFlow: [{ label: 'Cancelled', tone: 'destructive' }],
        actions: [
          'Book attendees — each booking gets its own QR code',
          'Check-in page: scan a QR with the camera, or type the code in manually',
          'Confirm, mark no-show, or cancel a booking',
          'Log feedback (rating out of 5 + "interested in purchasing")',
          'Schedule and complete follow-ups',
        ],
        tip: 'The Check-in page works from any device with a camera — hand it to whoever is meeting the bus.',
      },
      {
        id: 'reservations',
        icon: CalendarClock,
        title: 'Reservations',
        path: '/reservations',
        purpose: 'Temporarily hold a plot for a customer before a full sale is signed.',
        keyFields: ['Plot & customer', 'Reservation fee', 'Reserved at / expiry date'],
        flow: [{ label: 'Active' }, { label: 'Converted', tone: 'success' }],
        altFlow: [{ label: 'Expired', tone: 'warning' }, { label: 'Cancelled', tone: 'destructive' }],
        actions: ['Convert to sale — pre-fills a new Sale form from the reservation', 'Cancel a reservation'],
        tip: 'Reservations expire automatically on their expiry date and the plot returns to Available — no manual cleanup needed.',
      },
      {
        id: 'leads',
        icon: Contact,
        title: 'Leads',
        path: '/crm/leads',
        purpose: 'The pipeline of prospects, worked as a drag-and-drop Kanban board.',
        keyFields: ['Source — Facebook, Instagram, TikTok, Website, Referral, Billboard, Walk-in', 'Assigned agent, interested project, referred by'],
        flow: [
          { label: 'New' },
          { label: 'Contacted', tone: 'info' },
          { label: 'Interested', tone: 'info' },
          { label: 'Site Visit', tone: 'warning' },
          { label: 'Negotiating', tone: 'warning' },
          { label: 'Reserved', tone: 'warning' },
          { label: 'Purchased', tone: 'success' },
        ],
        altFlow: [{ label: 'Lost (reason required)', tone: 'destructive' }],
        actions: [
          'Drag a card between pipeline stages',
          'Quick-add a lead',
          'Filter by agent, project, or date range',
          'Select multiple leads to bulk move stage or bulk reassign',
          'Log notes and a communication log — call, WhatsApp, SMS, email',
        ],
      },
      {
        id: 'customers',
        icon: Users,
        title: 'Customers',
        path: '/crm/customers',
        purpose: 'Converted leads and organizations — the record tied to every sale, plot, and payment.',
        keyFields: ['Type — Individual or Organization', 'Full name / organization, phone, email, address'],
        actions: ['Create or edit a customer', 'Open a customer to see every plot, sale, and payment linked to them'],
      },
      {
        id: 'sales',
        icon: Receipt,
        title: 'Sales',
        path: '/sales',
        purpose: 'The actual transaction record — cash, installment, corporate, or bulk purchase.',
        keyFields: [
          'Sale type — Cash, Installment, Corporate, Bulk',
          'Payment method — cash, bank transfer, mobile money, cheque',
          'Sale price, discount, down payment, balance due',
        ],
        flow: [{ label: 'Active' }],
        altFlow: [{ label: 'Cancelled', tone: 'destructive' }],
        actions: [
          'Cancel a sale (only while it is Active)',
          'Set up payment plan — appears for installment sales with a balance still due',
          'View invoice (PDF) and every receipt (PDF) issued against the sale',
        ],
      },
      {
        id: 'installments',
        icon: Wallet,
        title: 'Installments',
        path: '/installments',
        purpose: 'The payment plan and schedule behind an installment sale.',
        keyFields: [
          'Principal, interest rate, number of installments, installment amount',
          'Start date, grace period (days), penalty rate',
          'Total payable, amount paid, outstanding balance',
        ],
        flow: [{ label: 'Active' }, { label: 'Completed', tone: 'success' }],
        altFlow: [{ label: 'Defaulted', tone: 'destructive' }, { label: 'Cancelled', tone: 'destructive' }],
        actions: [
          'Record payment against any due row — amount defaults to the remaining balance, plus method, reference, and notes',
          'Review the payment schedule — each row shows due date, amount, penalty, paid, balance, and its own status (Pending, Partial, Paid, Overdue)',
          'Open the Customer Ledger — every payment ever recorded against the plan',
        ],
      },
    ],
  },
  {
    id: 'money-records',
    title: 'Money & Records',
    description: 'Finance, reporting, documents, and legal paperwork.',
    modules: [
      {
        id: 'accounts',
        icon: Landmark,
        title: 'Accounts',
        path: '/finance/accounts',
        purpose: 'The chart of accounts — every asset, liability, equity, income, and expense account, arranged hierarchically.',
        keyFields: ['Account type — Asset, Liability, Equity, Income, Expense', 'Parent account (for hierarchy)', 'Bank / Cash / Petty cash kind, opening & running balance'],
        actions: ['Create an account under a parent', 'Open an account to see its running balance'],
      },
      {
        id: 'transactions',
        icon: ArrowLeftRight,
        title: 'Transactions',
        path: '/finance/transactions',
        purpose: 'Every recorded movement of money — income in, expenses out.',
        keyFields: [
          'Income: source (Sale, Installment, Other), account, deposit-to account, amount, date',
          'Expense: account, paid-from account, amount, date, payee',
        ],
        actions: ['Record an income entry', 'Record an expense entry'],
      },
      {
        id: 'finance-reports',
        icon: PieChart,
        title: 'Finance Reports',
        path: '/finance/reports',
        purpose: 'Profit & Loss and Cash Flow, computed for any date range.',
        actions: [
          'Profit & Loss — income and expense lines rolling up to net profit',
          'Cash Flow — per-account opening balance, inflow, outflow, and closing balance',
        ],
      },
      {
        id: 'reports',
        icon: ClipboardList,
        title: 'Reports',
        path: '/reports',
        purpose: 'Cross-module analytics in one place — tabs are shown or hidden based on what your role can view.',
        actions: [
          'Switch between Sales, Installments, Leads, Land Inventory, and Cash Flow tabs',
          'Filter each report and export the results',
        ],
      },
      {
        id: 'documents',
        icon: FileText,
        title: 'Documents',
        path: '/documents',
        purpose: 'The central file store for anything attached anywhere in the system, or uploaded standalone.',
        keyFields: ['Type — PDF, Word, Excel, Image, Video, CAD, GIS, Other', 'Category, linked record'],
        actions: [
          'Upload a new document',
          'Upload a new version — every document keeps a full version history with notes and uploader',
          'Search and filter by type or category',
        ],
        tip: 'Always upload a new version instead of replacing a file outright — the version history is the audit trail.',
      },
      {
        id: 'legal',
        icon: Scale,
        title: 'Legal',
        path: '/legal',
        purpose: 'Ownership transfers, sale agreements, title deeds, powers of attorney, and contracts — one tabbed workspace.',
        flow: [{ label: 'Transfer: Pending' }, { label: 'Approved', tone: 'warning' }, { label: 'Completed', tone: 'success' }],
        altFlow: [{ label: 'Rejected (reason required)', tone: 'destructive' }],
        actions: [
          'Ownership Transfers: Approve or Reject a pending transfer, then Complete transfer once approved — this marks the plot Transferred',
          'Sale Agreements: Draft → Sent for signature → Signed → Approved (or Void)',
          'Title Deeds: Pending → Applied → Issued → Approved',
          'Powers of Attorney: Pending → Active → Expired / Revoked',
          'Contracts: Draft → Active → Expired / Terminated',
          'Attach witnesses (name, national ID, phone) to any transfer, agreement, PoA, or contract',
          'Use Templates for standard document wording',
        ],
      },
    ],
  },
  {
    id: 'people',
    title: 'People',
    description: 'Staff, leave, payroll, and the agents who sell for you.',
    modules: [
      {
        id: 'employees',
        icon: Briefcase,
        title: 'Employees',
        path: '/hr/employees',
        purpose: 'Staff records and departments.',
        keyFields: ['Status — Active, On leave, Suspended, Terminated', 'Employment type — Full-time, Part-time, Contract, Intern'],
        actions: ['Create or edit an employee', 'Manage departments from HR Settings'],
      },
      {
        id: 'leave-requests',
        icon: CalendarOff,
        title: 'Leave Requests',
        path: '/hr/leave-requests',
        purpose: 'Time-off requests and approvals.',
        keyFields: ['Leave type, start/end date, reason, requested days'],
        flow: [{ label: 'Pending' }, { label: 'Approved', tone: 'success' }],
        altFlow: [{ label: 'Rejected', tone: 'destructive' }, { label: 'Cancelled', tone: 'destructive' }],
        actions: ['Approvers: Approve or Reject (reason required)', 'Employees: Cancel their own pending request'],
      },
      {
        id: 'payroll',
        icon: Wallet,
        title: 'Payroll',
        path: '/hr/payroll',
        purpose: 'Salary runs — basic salary, allowances, commission, and deductions rolled up to net pay.',
        keyFields: ['Basic salary, allowances, commission amount, deductions, net pay', 'Pay period start/end'],
        flow: [{ label: 'Draft' }, { label: 'Processed', tone: 'warning' }, { label: 'Paid', tone: 'success' }],
        actions: ['Process a draft run', 'Mark a processed run as paid'],
      },
      {
        id: 'agents',
        icon: UserSquare2,
        title: 'Agents',
        path: '/agents',
        purpose: 'The sales-agent roster and the commission engine that pays them.',
        keyFields: ['Agent code, territory', 'Commission plan — Percentage, Flat, or Tiered (rate per amount range)'],
        flow: [{ label: 'Payment: Pending' }, { label: 'Approved', tone: 'warning' }, { label: 'Paid', tone: 'success' }],
        altFlow: [{ label: 'Cancelled', tone: 'destructive' }],
        actions: [
          'Rankings — leaderboard by date range: sales count and total commission per agent',
          'Commission Settings — manage commission plans and territories',
          'Commission Payments — Approve a pending payment, then Mark paid with a payment reference',
        ],
      },
    ],
  },
]

export const ALL_MODULES: ManualModule[] = MANUAL_CATEGORIES.flatMap((c) => c.modules)
