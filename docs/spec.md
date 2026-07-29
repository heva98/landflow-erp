# LandFlow ERP — Specification

> A complete Enterprise Resource Planning (ERP) platform for Land Acquisition,
> Development, Sales, CRM, Installment Management, Survey Management, Legal
> Documentation, and Business Analytics.

This is the authoritative requirements document for LandFlow ERP. Claude Code
should refer to it for the exact fields, statuses, and features of each module.
For the build order and per-module prompts, see `BUILD_PLAN.md`.

---

## Context

This is an excellent ERP domain because most land companies still operate with
spreadsheets, WhatsApp, paper agreements, and manual payment tracking. A
well-designed ERP gives them a major operational advantage.

The design direction is inspired by Fursa Credit Services: a clean corporate
style with white backgrounds, dark green as the primary color, gold/yellow
accents, rounded cards, and large property images. The ERP keeps those colors
but presents them in a modern **admin interface** (similar to Linear, Odoo,
Monday.com, or ERPNext) rather than a marketing website.

---

## Overview

A modern, enterprise-grade ERP system for a Tanzanian real estate company
specializing in:

- Land acquisition
- Surveying
- Plot subdivision
- Plot sales
- Installment payments
- Customer relationship management
- Ownership transfer
- Marketing
- Site visits
- Agent commissions
- Document management
- Finance

The ERP must support organizations managing thousands of plots across multiple
projects simultaneously. The system must be modular, scalable, mobile
responsive, and production ready.

---

## Technology Stack

**Frontend**
- React 19
- TypeScript
- TailwindCSS
- ShadCN UI
- TanStack Query
- React Hook Form
- Zod
- Framer Motion

**Backend**
- Django
- Django REST Framework
- PostgreSQL
- Celery
- Redis
- JWT Authentication

**Storage**
- S3-compatible object storage

**Maps**
- Leaflet
- OpenStreetMap

**Charts**
- Recharts

**Documents**
- PDF generation
- Excel export

**Notifications**
- Email
- SMS
- WhatsApp

---

## Design Theme

Branding inspired by Fursa Credit Services.

| Token | Value |
|---|---|
| Primary — Dark Green | `#0E5B45` |
| Secondary — Gold | `#C89B3C` |
| Accent — Light Green | `#4CAF50` |
| Background | `#F8FAFC` |
| Sidebar | `#114232` |
| Danger | `#D32F2F` |
| Warning | `#F59E0B` |
| Info | `#2563EB` |
| Cards | Pure White |

- **Border radius:** 16px
- **Buttons:** rounded
- **Icons:** Lucide React
- **Animations:** smooth, minimal, professional — no clutter

---

## User Roles

Each role has independent permissions.

1. Administrator
2. Managing Director
3. Finance Manager
4. Sales Manager
5. Sales Agent
6. Surveyor
7. Legal Officer
8. CRM Officer
9. Receptionist
10. Marketing Officer
11. Cashier
12. Accountant
13. Document Officer
14. Site Manager
15. Customer
16. Auditor

---

## Dashboard

The dashboard must contain:

- Revenue Today
- Revenue This Month
- Plots Available
- Plots Reserved
- Plots Sold
- New Leads
- Site Visits Today
- Pending Transfers
- Installment Collection Rate
- Outstanding Balances
- Upcoming Payments
- Sales Pipeline
- Recent Activities
- Map showing projects
- Top Sales Agents
- Monthly Sales Graph
- Cash Flow
- Expense Summary
- Notifications
- Quick Actions

---

## Module 1 — Land Acquisition

**Purpose:** Track every land parcel before it becomes a project.

**Features**
- Land Owners
- Negotiations
- Due Diligence
- Ownership Verification
- Legal Checks
- Valuation
- Purchase Costs
- Attachments
- GPS Coordinates
- Maps
- Approval Workflow
- Acquisition Timeline

**Status:** Potential · Negotiating · Approved · Purchased · Cancelled

---

## Module 2 — Projects

Each acquired land becomes a Project (e.g. Buyuni Phase II, Kigamboni Green
Estate, Bagamoyo Palm City).

**Each project stores**
- Master Plan
- Location
- Maps
- Images
- Videos
- Nearby Services
- Total Area
- Acquisition Cost
- Development Cost
- Expected Revenue
- ROI
- Timeline

**Status:** Planning · Development · Selling · Completed

---

## Module 3 — Survey Management

- Survey Companies
- Surveyors
- Beacon Numbers
- Coordinates
- Subdivision
- Road Planning
- Utility Planning
- Survey Maps
- Upload CAD
- Upload GIS
- Approval
- History

---

## Module 4 — Plot Management

Each project contains plots. Each plot has:

- Plot Number
- Project
- Block
- Street
- Area
- Coordinates
- Polygon
- Corner Coordinates
- Images
- 360° Images
- Price
- Discount
- Current Owner
- GPS Location
- Google Maps
- Nearby Schools
- Nearby Roads
- Nearby Hospitals

**Status:** Available · Reserved · Sold · Transferred · Cancelled

---

## Module 5 — CRM

- Leads
- Customers
- Organizations
- Referrals
- Communication
- Notes
- Call History
- WhatsApp
- SMS
- Email
- Lead Pipeline

**Lead Sources:** Facebook · Instagram · TikTok · Website · Referral · Billboard · Walk-in

**Status:** New · Contacted · Interested · Site Visit · Negotiating · Reserved · Purchased · Lost

---

## Module 6 — Site Visits

- Booking
- Transport
- Bus Allocation
- Driver
- Attendance
- QR Check-in
- Feedback
- Photo Gallery
- Follow-up

---

## Module 7 — Reservations

- Reserve Plot
- Reservation Fee
- Expiry Date
- Automatic Expiry
- Reservation History
- Convert Reservation to Sale

---

## Module 8 — Sales

**Sale types:** Cash Sale · Installment Sale · Corporate Sale · Bulk Purchase

**Generate**
- Invoice
- Agreement
- Receipt
- Payment Schedule

---

## Module 9 — Installment Management

- Payment Plans
- Down Payment
- Monthly Installments
- Interest
- Grace Period
- Penalty
- Due Dates
- Automatic Reminders
- Outstanding Balance
- Customer Ledger
- Payment History
- Forecast Collection

---

## Module 10 — Finance

- Income
- Expenses
- Budgets
- Banks
- Cash
- Petty Cash
- Journals
- General Ledger
- Profit & Loss
- Balance Sheet
- Cash Flow
- Bank Reconciliation
- Taxes
- VAT

---

## Module 11 — Legal

- Title Deeds
- Ownership Transfer
- Sale Agreements
- Power of Attorney
- Contracts
- Witnesses
- Approvals
- Document Templates
- Digital Signatures

---

## Module 12 — Document Management

**Store:** PDF · Word · Excel · Images · Videos · CAD Files · GIS Files

- Search
- OCR
- Versioning
- Audit Trail

---

## Module 13 — Marketing

**Campaigns:** Facebook · Instagram · Google · WhatsApp · Email

- Bulk SMS
- Landing Pages
- QR Codes
- Campaign Analytics
- Lead Conversion

---

## Module 14 — Agents

- Commission Plans
- Performance
- Sales Targets
- Commission Payments
- Rankings
- Territories

---

## Module 15 — Customer Portal

- Customer Login
- Owned Plots
- Payment Progress
- Receipts
- Agreements
- Documents
- Upcoming Payments
- Support Tickets
- Map of Purchased Plot
- Ownership Timeline

---

## Module 16 — Inventory

- Unsold Plots
- Reserved Plots
- Transferred Plots
- Future Projects
- Available Area

---

## Module 17 — GIS Module

- Interactive Maps
- Satellite View
- Project Boundaries
- Plot Polygons
- Roads
- Schools
- Hospitals
- Utilities
- Search Plot
- Distance Measurement
- Drawing Tools

---

## Module 18 — HR

- Employees
- Attendance
- Payroll
- Leave
- Performance
- Departments

---

## Module 19 — Reports

- Sales Reports
- Finance Reports
- Lead Reports
- Agent Reports
- Installment Reports
- Survey Reports
- Land Inventory
- Cash Flow
- ROI
- Profitability
- Customer Statements

**Export:** Excel · PDF

---

## Module 20 — System Administration

- Users
- Roles
- Permissions
- Audit Logs
- Activity Logs
- Backups
- Settings
- Email Templates
- SMS Templates
- WhatsApp Templates
- Currencies
- Locations
- Approval Workflow

---

## Automation

The system should automatically:

- Generate plot numbers after subdivision.
- Send WhatsApp, SMS, and email reminders for installment due dates.
- Expire unpaid reservations and return plots to Available.
- Update project statistics when plots are sold.
- Generate customer ledgers after each payment.
- Produce receipts and tax invoices.
- Notify legal staff when ownership transfer is ready.
- Calculate agent commissions automatically.
- Alert managers to overdue installments.
- Build dashboards in real time.
- Track every action in an immutable audit log.

---

## AI Features

> **Note:** AI features are deferred and out of scope for the current build phases
> (see `BUILD_PLAN.md`). They are documented here for future reference only.

Integrate AI to:

- Recommend plots based on customer budget, preferred location, and desired plot size.
- Predict the likelihood of a lead converting into a sale.
- Forecast monthly cash collections from installment plans.
- Detect overdue accounts and recommend follow-up actions.
- Generate sales summaries and executive reports.
- Answer natural-language queries such as "Show all available plots under TZS 20 million in Kigamboni."

---

## Mobile App

> **Note:** Mobile apps are deferred and out of scope for the current build phases.

Companion apps for Sales Agents and Surveyors with offline support, GPS-based
plot verification, digital forms, image uploads, QR scanning, customer
signatures, payment receipt capture, and automatic synchronization when
connectivity is restored.

---

## Suggested Development Roadmap

Organized into phases rather than building everything at once:

- **Phase 1 — Core Operations:** Authentication, Dashboard, Projects, Plot
  Management, CRM, Reservations, Sales, Installments, Finance, Reports.
- **Phase 2 — Operations & Compliance:** Land Acquisition, Survey Management,
  GIS, Legal, Document Management, Customer Portal.
- **Phase 3 — Growth & Intelligence:** Marketing Automation, Agent Management,
  Mobile Apps, AI, Business Intelligence, API integrations.

This structure gives Claude Code a clear architecture to scaffold while leaving
room to iteratively implement enterprise-grade features.
