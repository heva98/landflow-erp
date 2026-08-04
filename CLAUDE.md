# LandFlow ERP — Project Guide for Claude Code

## What this is
An enterprise ERP for a Tanzanian real-estate / land company. It manages the full
lifecycle: land acquisition → survey → subdivision → plot sales → installment
payments → ownership transfer, plus CRM, finance, legal, document management and
reporting. It must handle thousands of plots across many concurrent projects.
Primary currency is TZS. UI is an internal admin tool (think Linear / Odoo /
ERPNext), **not** a marketing website.

## Stack — do not deviate without asking
**Backend:** Django 6 + Django REST Framework, PostgreSQL, JWT auth
(djangorestframework-simplejwt), Celery + Redis for async and scheduled jobs.
**Frontend:** React 19 + TypeScript + Vite, TailwindCSS, ShadCN UI,
TanStack Query (server state), React Hook Form + Zod (forms/validation),
Framer Motion (animation), Recharts (charts), Leaflet + OpenStreetMap (maps),
lucide-react (icons).
**Storage:** S3-compatible object storage for files, images and documents.

## Repo layout
```
backend/    Django project — config/ (settings) + apps/ (one app per module)
frontend/   Vite app — src/features/<module>/ feature folders
docs/        spec.md (full requirements) + BUILD_PLAN.md (build sequence)
CLAUDE.md    this file
docker-compose.yml   postgres + redis for local dev
```

## Backend conventions
- One Django app per domain module under `backend/apps/` (e.g. `apps/projects`, `apps/plots`).
- Models use **UUID primary keys**; every model has `created_at` and `updated_at`
  (inherit from a shared `apps/core` base model).
- Money is `DecimalField(max_digits=14, decimal_places=2)`. Never floats for money.
- Status fields use `TextChoices` enums, matching the statuses in `docs/spec.md`.
- API: DRF `ViewSet`s + routers, versioned under `/api/v1/`. Serializers live
  separately from views. Every list endpoint is paginated and filterable
  (django-filter).
- **Authorization is role-based and enforced per-endpoint on the server.** Never
  rely on the frontend for permissions.
- Every state-changing action writes an immutable audit-log entry.
- Write pytest tests for each module's models and its key endpoints.
- Always generate and commit migrations. Never edit an already-applied migration.

## Frontend conventions
- Feature-folder structure: `src/features/<module>/{components,hooks,api,types}`.
- All server data flows through **TanStack Query** hooks — no stray `fetch()`/axios
  calls inside components.
- Forms use React Hook Form + a **Zod schema as the single source of truth** for
  the form's shape and validation.
- Use ShadCN components; don't hand-roll inputs, dialogs, tables or toasts.
- Dense, fast, keyboard-friendly admin UI. Minimal decoration.

## Design tokens
| Token | Value |
|---|---|
| Primary (orange) | `#FF8427` (hover `#E56F13`) |
| Secondary (navy) | `#17255A` |
| Surface / Surface alt | `#E8E9F3` / `#EDF2FA` |
| Sidebar | `#17255A` |
| Background | `#E8E9F3` |
| Cards | `#FFFFFF` |
| Text / Text inverse | `#17255A` / `#FFFFFF` |
| Danger / Warning / Info | `#D32F2F` / `#F59E0B` / `#2563EB` |
Card radius 16px, rounded buttons, lucide-react icons, smooth/minimal motion.

## Working rhythm — important
Build **one module at a time**, in this order per module:
1. Models + migration
2. Serializers + viewsets + permissions + pytest tests
3. Frontend feature (types → api → query hooks → pages)
4. Run it and verify end to end

Do **not** start a new module until the current one runs end to end. Keep diffs
small and reviewable. Pause after step 1 of each module so I can review the data
model before you build on it.

## Out of scope for now — do NOT build
AI features (recommendations, lead scoring, forecasting, natural-language query)
and the mobile apps. Do not scaffold, stub, or add dependencies for them.
