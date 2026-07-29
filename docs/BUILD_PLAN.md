# LandFlow ERP — Build Plan

This is the order to build LandFlow in, and the exact prompts to give Claude Code.
Work top to bottom. **Don't skip ahead** — later modules depend on earlier ones.

## How to use this plan
1. Open the repo in VS Code and start Claude Code.
2. Copy one prompt block below into Claude Code and let it work.
3. **After the models step of each module, review the models before continuing.**
   Claude Code is told to pause there.
4. Verify the module runs end to end (migrate, run server, click through the UI)
   before moving to the next prompt.
5. Commit after each module. Small commits make it easy to back out mistakes.

If a module prompt is too big for one run, split it: run "models + migration"
first, then "API + tests", then "frontend" as three separate messages.

AI features and mobile apps are intentionally excluded.

---

# PHASE 0 — Foundation
Everything depends on this. Get it fully working before any business module.

### P0.1 — Backend scaffold
> Scaffold the Django backend in `backend/` following CLAUDE.md. Create a Django 5
> project called `config`, add DRF, PostgreSQL via django-environ, CORS, and JWT
> auth with simplejwt. Wire Celery + Redis in `config/celery.py`. Create an
> `apps/` package and an `apps/core` app containing: a `BaseModel` abstract model
> (UUID pk, created_at, updated_at) and an immutable `AuditLog` model plus a signal
> that records create/update/delete on registered models. Add a repo-root
> `docker-compose.yml` that runs **postgres and redis only**, a `requirements.txt`,
> and a `.env.example`. Make sure `python manage.py migrate` and `runserver` work.
> Do not build any business modules yet. Pause when the models are done so I can review.

### P0.2 — Users, roles, permissions
> In `backend/apps/accounts`, implement a custom `User` model (email login, UUID pk)
> and a `Role` model. Seed the 16 roles listed in docs/spec.md and a permission
> scheme that DRF viewsets can enforce per-endpoint. Expose JWT login + refresh and a
> `GET /api/v1/me` endpoint returning the user with role and permissions. Add pytest
> tests for login, refresh, and permission enforcement. Pause after the models.

### P0.3 — Frontend scaffold + login
> Scaffold `frontend/` per CLAUDE.md: Vite + React 19 + TS, Tailwind configured with
> the design tokens, ShadCN initialized, a TanStack Query provider, React Router, and
> an axios client that attaches the JWT and refreshes it on 401. Build the
> authenticated app shell: a sidebar (#114232) with placeholder nav, a top bar, and a
> login page wired to `/api/v1` auth. After login, route to an empty Dashboard page.
> Prove login works end to end against the running backend.

---

# PHASE 1 — Core Operations
The revenue spine of the business. Build strictly in this order.

### P1.1 — Projects
> Build the Projects module (spec Module 2) end to end per the CLAUDE.md rhythm:
> models + migration, then API + permissions + tests, then the frontend feature
> (list, detail, create/edit) under `src/features/projects`. Include master plan,
> location, area, acquisition/development cost, expected revenue, ROI, timeline, and
> the status enum (Planning/Development/Selling/Completed). Pause after the models.

### P1.2 — Plot Management
> Build the Plot Management module (spec Module 4), depends on Projects. Plot belongs
> to a Project and optionally a Block/Street. Include plot number, area, price,
> discount, coordinates + polygon (store GeoJSON for now), images, current owner
> (nullable), and the status enum (Available/Reserved/Sold/Transferred/Cancelled).
> Full CRUD API with filtering by project/status/price, plus the frontend feature.
> Pause after the models.

### P1.3 — CRM (Leads & Customers)
> Build the CRM module (spec Module 5): Lead, Customer, Organization, plus notes and
> communication log. Include lead source and the lead-status pipeline from the spec.
> Provide a Kanban-style pipeline view and a customer directory on the frontend.
> Pause after the models.

### P1.4 — Reservations
> Build Reservations (spec Module 7), depends on Plots + Customers. A reservation
> holds a plot for a customer with a reservation fee and an expiry date, and can be
> converted to a sale. Add a Celery beat task that expires overdue reservations and
> returns the plot to Available. Frontend: reserve action from a plot, reservations
> list. Pause after the models.

### P1.5 — Sales
> Build Sales (spec Module 8), depends on Plots, Customers, Reservations. Support cash
> and installment sale types. On sale, mark the plot Sold and set its owner. Generate
> an invoice and a receipt record (PDF generation can be a stub returning a simple
> PDF for now). Frontend: create-sale flow (from a reservation or directly), sales
> list, sale detail. Pause after the models.

### P1.6 — Installment Management
> Build Installments (spec Module 9), depends on Sales. Payment plan with down
> payment, monthly schedule, due dates, penalties, grace period. Record payments
> against the schedule and maintain a customer ledger + outstanding balance. Add a
> Celery beat task that flags overdue installments. Frontend: payment schedule view,
> record-payment action, customer ledger. Pause after the models.

### P1.7 — Notifications foundation
> Add a small notifications app: an email backend and a Celery-beat scheduler, plus a
> `Notification` model and reusable templates. Wire installment due-date reminders and
> overdue alerts to it (email only for now — SMS/WhatsApp come later in Marketing).

### P1.8 — Finance
> Build Finance (spec Module 10), depends on Sales/Installments for income. Income,
> expenses, budgets, banks/cash accounts, journals, general ledger, and Profit & Loss
> + Cash Flow reports. Pull sales and installment payments in as income
> automatically. Frontend: accounts, transactions, and the P&L / cash-flow views.
> Pause after the models.

### P1.9 — Reports
> Build the Reports module (spec Module 19): sales, installment, lead, land-inventory
> and cash-flow reports, each with Excel and PDF export. Reuse existing model data;
> don't duplicate it. Frontend: a reports page with filters and export buttons.

### P1.10 — Dashboard
> Fill in the Dashboard page using the widgets from the spec that we now have data
> for: revenue today/this month, plots available/reserved/sold, new leads, pending
> transfers, outstanding balances, upcoming payments, monthly sales graph (Recharts),
> top sales agents, and recent activity from the audit log. Add the aggregate API
> endpoints it needs.

**End of Phase 1: you have a usable ERP.** Everything below is expansion.

---

# PHASE 2 — Operations & Compliance

### P2.1 — Land Acquisition (spec Module 1)
> Build Land Acquisition: land owners, negotiations, due diligence, valuation,
> purchase costs, GPS coordinates, attachments, approval workflow, and the status
> enum. An approved acquisition can spawn a Project. Frontend feature + pause after models.

### P2.2 — Survey Management (spec Module 3)
> Build Survey Management: survey companies, surveyors, beacon numbers, coordinates,
> subdivision, CAD/GIS uploads, approval and history. Subdivision output feeds plot
> creation for a project. Pause after models.

### P2.3 — Document Management (spec Module 12)
> Build Document Management: store PDF/Word/Excel/image/CAD/GIS files in S3-compatible
> storage, with search, versioning and audit trail. Make it reusable so other modules
> attach documents to their records.

### P2.4 — Legal (spec Module 11)
> Build Legal: title deeds, sale agreements, ownership transfer, power of attorney,
> contracts, witnesses, approvals, and document templates. Ownership transfer updates
> the plot to Transferred and notifies legal staff. Depends on Sales + Documents.
> Pause after models.

### P2.5 — GIS Module (spec Module 17)
> Build the GIS module with Leaflet + OpenStreetMap: interactive map, project
> boundaries, plot polygons colored by status, search a plot, distance measurement and
> drawing tools. Read polygon data from the Plots module.

### P2.6 — Site Visits (spec Module 6)
> Build Site Visits: booking, bus/driver allocation, QR check-in attendance, feedback,
> photo gallery, follow-up. Links to CRM leads. Pause after models.

### P2.7 — Customer Portal (spec Module 15)
> Build the Customer Portal: customer login, owned plots, payment progress, receipts,
> agreements, documents, upcoming payments, support tickets, and a map of the
> purchased plot. Reuse Installments, Sales, Documents and GIS. Enforce that customers
> see only their own records.

---

# PHASE 3 — Growth (no AI, no mobile)

### P3.1 — Agents & Commissions (spec Module 14)
> Build Agents: commission plans, sales targets, performance, commission payments,
> rankings, territories. Auto-calculate commission when a sale closes. Depends on Sales.

### P3.2 — Marketing (spec Module 13)
> Build Marketing: campaigns, landing pages, QR codes, campaign analytics, lead
> conversion, and bulk SMS/WhatsApp/email. Integrate SMS and WhatsApp providers here
> (Twilio / WhatsApp Business API) and wire them into the notifications app from P1.7.
> Note: provider approval has lead time — start those applications early.

### P3.3 — Inventory (spec Module 16)
> Build Inventory as reporting views over existing plot data: unsold, reserved,
> transferred, available area, future projects. Mostly read-only aggregation.

### P3.4 — HR (spec Module 18)
> Build HR: employees, attendance, payroll, leave, performance, departments.
> Standalone module.

### P3.5 — System Administration (spec Module 20)
> Build the admin surfaces: audit-log viewer, activity logs, settings, email/SMS/
> WhatsApp template management, currencies, locations, and the approval-workflow
> configuration. Users/roles/permissions already exist from P0.2 — build the UI for them.

---

## Deferred (not now)
- AI features (Module: recommendations, lead scoring, forecasting, NL query)
- Mobile apps for agents/surveyors (offline sync, GPS verification)
