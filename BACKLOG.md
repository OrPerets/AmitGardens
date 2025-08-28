## MVP Backlog — Amit Gardens Monthly Assignments

### Scope

- **Goal**: MVP production‑ready app to schedule gardening jobs per month, with admin plan creation, per‑gardener magic links, public per‑gardener assignment form, admin overview, CSV export, plan lock/unlock, and reminders stub.
- **App type**: Next.js 14 (App Router, TypeScript, ESM), MongoDB Atlas (serverless), TailwindCSS + shadcn/ui (RTL, mobile‑first, accessible), Zod, React Hook Form, dayjs.
- **Constraints**: No NextAuth. Admin login via env‑configured credentials + signed session cookie. Magic links use SHA‑256 token hashing with salt; basic rate limiting on public routes. Strong validations, clear errors, clean repository layer.

### Milestones / Phases

1) Foundation & Tooling
2) Data Layer (Types, Mongo Client, Indexes, Repositories)
3) Utilities (Crypto, Cookies, Dates, CSV)
4) Validators (Zod)
5) API Layer (Public + Admin + Rate Limit)
6) UI Foundations (Layout, Theme, RTL, shadcn, Toast)
7) Public Plan Page (Assignments flow)
8) Admin Auth & Guard
9) Admin Dashboard (KPIs, Table, Actions)
10) Docs, DevEx, and Readme
11) Quality: Testing, Accessibility, Performance
12) Deploy (Vercel) & Release Checklist

---

## 1) Foundation & Tooling

### Tasks

- Initialize Next.js 14 project with App Router and TypeScript (strict).
- Configure ESLint (strict), Prettier, EditorConfig.
- Install dependencies: mongodb, zod, react‑hook‑form, dayjs, tailwindcss, @radix‑ui/react‑*, class‑variance‑authority, tailwind‑merge, shadcn/ui, lucide‑react, cookie, @types/node, @types/cookie.
- Configure Tailwind with RTL support (logical properties), base styles, typography, and shadcn/ui setup.
- Enable `app/` directory routing (App Router) with ESM.
- Add `public/favicon.ico`.
- Create `.env.example` matching required envs.
- Add `npm scripts`: dev, build, start, lint, format.

### Deliverables

- TypeScript strict mode on; lint passes; basic app boots locally.
- `.env.example` ready; README placeholder.

### Acceptance Criteria

- Running `npm run dev` starts app without console errors.
- `tailwind` styles compile; shadcn/ui components import correctly.
- Type checking passes on a clean project.

---

## 2) Data Layer (Types, Mongo Client, Indexes, Repositories)

### Files

- `types/db.ts`
- `lib/mongo.ts`
- `app/api/admin/init/route.ts` (indexes + demo seed)
- `lib/repositories/`:
  - `gardeners.ts`
  - `plans.ts`
  - `planLinks.ts`
  - `assignments.ts`
  - `submissions.ts`

### Tasks

- Define TypeScript interfaces per spec in `types/db.ts`:
  - `Gardener`, `Plan`, `PlanLink`, `Assignment`, `Submission`.
- Implement Mongo serverless client reuse in `lib/mongo.ts` (per provided snippet) with `MONGODB_URI`, `MONGODB_DB`.
- Implement `GET /api/admin/init`:
  - Create unique indexes:
    - `plans`: `{ year:1, month:1 }` unique
    - `plan_links`: `{ plan_id:1, gardener_id:1 }` unique; `{ expires_at:1 }` (TTL optional)
    - `assignments`: `{ plan_id:1, gardener_id:1, work_date:1, address:1 }` unique
    - `submissions`: `{ plan_id:1, gardener_id:1 }` unique
  - Optional: create `ratelimits` TTL index if using fixed window TTL helper fields.
  - Seed demo: 3 gardeners, one plan (e.g., September), optional sample assignments, and initial submissions.
- Implement repositories:
  - `plans.ts`: `getPlanByYyyymm`, `toggleLock`, `createPlanIfMissing`.
  - `gardeners.ts`: `listGardeners`, `getGardenerById`.
  - `planLinks.ts`: `createOrUpdateLinksForPlan` (generate token per gardener, store only `token_hash`), `resolveLink(plan, gardenerId, token)`.
  - `assignments.ts`: `listByPlanAndGardener`, `bulkUpsert(planId, gardenerId, rows)`, `deleteById`, `importFromPrevMonth`.
  - `submissions.ts`: `getStatus`, `submit`, `revert`.

### Deliverables

- All collections defined and index creation successful from `GET /api/admin/init`.
- Repository CRUD is covered with type‑safe functions and input params.

### Acceptance Criteria

- Hitting `GET /api/admin/init` is idempotent and completes without errors.
- Unique constraints enforced by DB (duplicate upserts rejected at DB level when keys conflict beyond upsert intended behavior).
- Repository methods unit‑stubbed or exercised via the API in later phases.

---

## 3) Utilities (Crypto, Cookies, Dates, CSV)

### Files

- `lib/crypto.ts`
- `lib/cookies.ts`
- `lib/utils/dates.ts`
- `lib/utils/csv.ts`

### Tasks

- `crypto.ts`:
  - `hashToken(token)` returns `sha256:` + hex from `SALT + token` using `CRYPTO_TOKEN_SALT`.
  - `generateToken(bytes = 32)` returns random hex.
- `cookies.ts`:
  - Implement signed session cookie utilities using `SESSION_SECRET` (HMAC SHA‑256) with helpers:
    - `setAdminSessionCookie(response, session)`
    - `readAdminSessionCookie(request)` → `{ email } | null`
    - `clearAdminSessionCookie(response)`
  - Cookie flags: `httpOnly`, `secure` (on prod), `sameSite='lax'`, reasonable `maxAge`.
- `dates.ts`:
  - Normalize Date to 00:00 local (strip time to start of local day).
  - Parse `YYYY-MM` to `{ year, month }` and `yyyymm` string handling.
  - Helpers to check if a given date is within plan month.
- `csv.ts`:
  - Export array of objects to CSV (UTF‑8 with BOM), configurable columns + header mapping.

### Acceptance Criteria

- Token hashes stable and not reversible; plain tokens never stored.
- Session cookie can be set, validated, and cleared; tampering detected.
- Dates normalized consistently; cross‑TZ duplicates avoided by 00:00 local convention.
- CSV opens correctly in Excel with Hebrew text (BOM + UTF‑8).

---

## 4) Validators (Zod)

### File

- `lib/validators.ts`

### Schemas

- `PlanQuerySchema`: `{ plan: 'YYYY-MM', g: string, t: string }` and a variant accepting `yyyymm` where relevant.
- `AssignmentRowSchema`: `{ date: ISO string, address: nonempty string, notes?: string }`.
- `BulkUpsertSchema`: `{ plan: 'YYYY-MM', g, t, rows: AssignmentRow[] }`.
- `SubmitSchema`: `{ plan: 'YYYY-MM', g, t }` (even if body none, keep consistency).
- `AdminAuthSchema`: `{ email: string.email(), password: string.min(8) }`.

### Acceptance Criteria

- Invalid inputs produce 400 with readable error messages; all API routes rely on Zod parsing.

---

## 5) API Layer (Public + Admin + Rate Limit)

### Files

- Public
  - `app/api/link/resolve/route.ts`
  - `app/api/assignments/route.ts` (GET, POST)
  - `app/api/assignments/[id]/route.ts` (DELETE)
  - `app/api/submission/submit/route.ts`
  - `app/api/submission/revert/route.ts`
- Admin
  - `app/api/admin/login/route.ts` (Missing in file list; required by spec) ← add
  - `app/api/admin/links/create/route.ts`
  - `app/api/admin/overview/route.ts`
  - `app/api/admin/lock/route.ts`
  - `app/api/admin/unlock/route.ts`
  - `app/api/admin/remind/route.ts` (stub)
  - `app/api/admin/init/route.ts` (from Phase 2)
- Rate limit support collection: `ratelimits`.

### Cross‑cutting

- Add `export const dynamic = 'force-dynamic'` on important GET routes.
- Use `NextResponse.json(...)` consistently with proper status codes.
- Centralized helper for rate‑limit checks on public routes:
  - Keyed by `ip + path` with sliding window (e.g., 60 req / 10 min). Store hits with timestamps; prune window; deny over limit with 429.
- Error handling: return standardized shape `{ error: { code, message } }`.

### Endpoint Contracts (high‑level)

- `GET /api/link/resolve?plan=YYYY-MM&g=...&t=...`
  - Validates token hash vs `plan_links`, checks `expires_at`, plan `locked`/`deadline`.
  - Returns `{ plan, gardener, submission }`.
  - Errors: 400 invalid query, 401 invalid token, 410 expired, 404 not found.
- `GET /api/assignments?plan=YYYY-MM&g=...&t=...`
  - Returns ordered list by `work_date`.
  - Errors mirror resolve.
- `POST /api/assignments`
  - Body `{ plan, g, t, rows: AssignmentRow[] }`; Zod validation; normalize dates to local 00:00; `upsert` per unique key.
  - Returns `{ upserted: number, updated: number }`.
- `DELETE /api/assignments/[id]`
  - Auth via `plan,g,t`; verifies ownership; deletes assignment.
- `POST /api/submission/submit`
  - Checks `locked`/`deadline`, sets `submissions.status='submitted'` + `submitted_at=now()`.
- `POST /api/submission/revert`
  - Reverts to `draft` if before deadline and not locked.
- `POST /api/admin/login`
  - Validates credentials against env; on success sets signed session cookie.
- `POST /api/admin/links/create`
  - For a given plan, generates or refreshes links for all gardeners. Stores only hashes. Returns one‑time plain tokens/URLs in response mapping for copy.
- `GET /api/admin/overview?plan=YYYY-MM[&format=csv]`
  - Aggregates KPIs (submitted/total, #assignments, coverage days) and list of assignments with gardener names. If `format=csv`, returns CSV with BOM.
- `POST /api/admin/lock` / `POST /api/admin/unlock`
  - Toggles `plans.locked`.
- `POST /api/admin/remind` (stub)
  - Logs reminder intent; returns 202.

### Acceptance Criteria

- Public routes enforce rate limits; blocked requests get 429.
- All routes use Zod validation and return typed responses.
- Admin routes require valid session cookie; unauthenticated gets 401 and redirect hints for UI.
- `create links` returns plain tokens only once; DB stores hashes only.

---

## 6) UI Foundations (Layout, Theme, RTL, shadcn, Toast)

### Files

- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx` (redirect to `/admin/login`)
- UI providers: Toaster, Theme tokens.

### Tasks

- Set `<html dir="rtl" lang="he">` and mobile‑first viewport.
- Load modern Hebrew‑friendly font; base Tailwind resets.
- Add Toast provider (e.g., `sonner` or shadcn toast) and error boundary for app.
- Ensure color contrast and focus styles (accessibility).

### Acceptance Criteria

- Lighthouse (mobile) ≥ 95; no console errors; basic pages render.

---

## 7) Public Plan Page (Assignments Flow)

### Files

- `app/(public)/plan/[yyyymm]/page.tsx`
- Components:
  - `components/AssignmentRow.tsx`
  - `components/BulkPasteDialog.tsx`
  - `components/MonthPicker.tsx`

### Tasks

- Parse `searchParams: { g, t }`; call `GET /api/link/resolve` on mount (RSC+client pattern as needed).
- Header: “שיבוץ לחודש {MMMM YYYY} – {שם הגנן}”; show deadline and submitted status; progress bar (#days assigned / active days).
- Table (shadcn Table):
  - Row fields: DatePicker limited to month, Address (autocomplete from this gardener’s past addresses — load prior assignments), Notes, Delete.
  - RHF Controllers + Zod resolver for row validation.
- Actions:
  - “הוסף שורה” — append empty row.
  - “הדבקה מרשימה” — open dialog + parse lines `YYYY-MM-DD | כתובת | הערות` → preview + merge rows.
  - “ייבוא מהחודש הקודם” — calls repository/API to import from prev month (server upsert then refetch).
  - “שמור טיוטה” — persist to localStorage.
  - “שליחה סופית” — POST submit; disable editing after submit; reflect locked state.
- Read‑only UI if plan locked or after submission.
- Toasts for success/error; inline validation hints.

### Acceptance Criteria

- Invalid link or expired → friendly error with 401/410 handling.
- Add/edit/delete rows updates server; GET reflects latest; normalization prevents duplicate day collisions.
- Paste parsing robust to whitespace; Hebrew text preserved.
- Import from previous month works and de‑duplicates by unique key.
- Submit disabled when locked or past deadline; revert available when allowed.

---

## 8) Admin Auth & Guard

### Files

- `app/admin/login/page.tsx`
- `components/AdminGuard.tsx`
- `app/page.tsx` → redirect to `/admin/login`

### Tasks

- Login page: RHF + Zod (`AdminAuthSchema`), POST to `/api/admin/login`.
- On success, set session cookie and redirect to `/admin/plan/[yyyymm]` (current month default).
- `AdminGuard` HOC/Client component to check session (RSC can also check cookie) and gate admin pages; redirect to login on 401.

### Acceptance Criteria

- Wrong credentials show inline error; correct credentials land on admin dashboard.
- Session persists across reloads; logout clears cookie.

---

## 9) Admin Dashboard (KPIs, Table, Actions)

### Files

- `app/admin/plan/[yyyymm]/page.tsx`
- Components:
  - `components/StatsCards.tsx`
  - Shared table filters (Gardener select, Date range picker)

### Tasks

- Fetch `GET /api/admin/overview?plan=YYYY-MM` to display:
  - KPIs: submitted/total gardeners, #assignments, coverage days.
  - Aggregated table: `תאריך | גנן | כתובת | הערות` with filters.
- Actions:
  - `Export CSV` — call overview with `format=csv` and trigger download (UTF‑8 BOM).
  - `Create Links` — POST to create/refresh links; show one‑time tokens/URLs for copy.
  - `Lock/Unlock` — POST lock/unlock and optimistically update UI.
  - `Send Reminders` — call stub; show toast.

### Acceptance Criteria

- KPIs correct for demo and real data; filters work; CSV opens in Excel correctly.
- Lock/unlock immediately affects public form behavior.

---

## 10) Docs, DevEx, and README

### Files

- `README.md`
- `.env.example`

### Tasks

- Write detailed README:
  - Setup, install, envs, `npm run dev`, `npm run build/start`.
  - First‑run call to `GET /api/admin/init` to create indexes + seed demo.
  - Deployment guide for Vercel with env variables.
  - Security notes: magic links, token hashing, session cookies, rate limits.
  - Validators and data normalization overview.

### Acceptance Criteria

- A new dev can clone, configure envs, seed, and run end‑to‑end flows locally within 15 minutes.

---

## 11) Quality: Testing, Accessibility, Performance

### Tasks

- Add lightweight unit tests where practical (utils: crypto, dates, csv, validators).
- Add Playwright or Cypress e2e happy‑path flows (optional for MVP; document manual test plan if not included).
- Accessibility pass: keyboard navigation, focus order, form labels, color contrast.
- Performance/Lighthouse optimization: image lazy load (if any), reduce client JS where possible, ensure `dynamic='force-dynamic'` only where needed, cache headers where safe.
- Error boundaries and toast surfacing for API errors.

### Acceptance Criteria

- Lighthouse mobile score ≥ 95; zero severe a11y violations.
- Manual acceptance criteria (below) pass locally.

---

## 12) Deploy (Vercel) & Release Checklist

### Tasks

- Configure Vercel project, link repo, set env variables.
- Verify serverless Mongo connectivity; ensure connection reuse works in serverless runtime.
- Validate public URL flows, rate limiting at edge or server scope as implemented.
- Final smoke test: seed, create links, submit assignments, admin overview, CSV, lock/unlock.

### Acceptance Criteria

- End‑to‑end flows work on production URL; logs clean; rate limit effective.

---

## Endpoint Contracts (Detailed)

Note: All responses use `application/json` unless `format=csv`.

### Public

- `GET /api/link/resolve?plan=YYYY-MM&g=<gardenerId>&t=<token>`
  - 200: `{ plan: { year, month, deadline, locked }, gardener: { _id, display_name, ... }, submission: { status, submitted_at? } }`
  - 400/401/404/410 per checks; 429 on rate limit.
- `GET /api/assignments?plan=YYYY-MM&g=...&t=...`
  - 200: `{ items: Assignment[] }` sorted by `work_date` asc.
- `POST /api/assignments`
  - Body: `{ plan, g, t, rows: { date, address, notes? }[] }`
  - 200: `{ upserted, updated }`.
- `DELETE /api/assignments/[id]?plan=YYYY-MM&g=...&t=...`
  - 200: `{ deleted: 1 }` if existed.
- `POST /api/submission/submit`
  - Body: `{ plan, g, t }` → 200 `{ status: 'submitted' }` or 409 if locked/after deadline.
- `POST /api/submission/revert`
  - Body: `{ plan, g, t }` → 200 `{ status: 'draft' }` or 409 if not allowed.

### Admin

- `POST /api/admin/login`
  - Body: `{ email, password }` vs `NEXT_ADMIN_EMAIL/PASSWORD` → set cookie; 200 `{ ok: true }`.
- `POST /api/admin/links/create`
  - Body: `{ plan: 'YYYY-MM' }` → 200 `{ links: Array<{ gardener_id, url, token }> }` (tokens only once).
- `GET /api/admin/overview?plan=YYYY-MM[&format=csv]`
  - 200 JSON: `{ kpis: {...}, items: Array<{ date, gardener_name, address, notes }> }`.
  - CSV: `text/csv; charset=utf-8` with BOM; same fields.
- `POST /api/admin/lock` / `POST /api/admin/unlock`
  - Body: `{ plan: 'YYYY-MM' }` → 200 `{ locked: boolean }`.
- `POST /api/admin/remind`
  - Body: `{ plan: 'YYYY-MM' }` → 202 `{ ok: true }` (stub only).
- `GET /api/admin/init`
  - No body → 200 `{ ok: true }` after index/seed.

---

## Data Model & Indexes

- Collections: `gardeners`, `plans`, `plan_links`, `assignments`, `submissions`, `ratelimits`.
- Unique indexes as specified; consider partial filters for TTL where applicable.
- Assignment unique key: `(plan_id, gardener_id, work_date, address)`; dates normalized to 00:00 local.

---

## UX Rules & Business Logic

- Month parameter `yyyymm` strictly validated; date pickers constrained to plan month only.
- Read‑only public form when plan locked; `submitted` state prevents edits unless reverted and allowed.
- Deadlines enforced on submit/revert; server is source of truth.
- Error states clearly surfaced via toasts and inline messages.

---

## Acceptance Criteria (End‑to‑End)

### Public

- Invalid `g`+`t` link → 401/410 with user‑friendly message.
- Add rows, delete, paste bulk, import previous month → all persist and reflect on reload.
- Final submit blocked if past deadline or locked; revert allowed only before deadline and when not locked.

### Admin

- Login protects dashboard; unauthenticated users are redirected to `/admin/login`.
- Overview KPIs correct; export CSV is valid UTF‑8 BOM and opens in Excel with Hebrew headers/data.
- Lock/Unlock immediately changes public form behavior.
- Create Links stores only token hashes; plain tokens only shown once.

---

## Definition of Done

- End‑to‑end scenario works: plan exists, links created, public fill and submit/revert, admin dashboard overview and CSV, lock/unlock.
- Lighthouse mobile ≥ 95; no console errors; clear error handling.
- ESLint clean; TS strict; repository/util separation.
- README guides from zero to production deploy.

---

## Risks, Decisions, and Open Questions

- Timezone handling: normalize to local 00:00; document that server assumes a single locale (Israel) for month boundaries; if multi‑TZ needed later, store explicit timezone.
- Token TTL: optional; keep `expires_at` nullable for indefinite validity if admin prefers; admin can regenerate tokens per month.
- Admin login route was not listed in file layout but required by spec; include `app/api/admin/login/route.ts`.
- Rate limit persistence: choose sliding window with pruning; if high traffic later, consider Redis.
- Address autocomplete: built from previous assignments only; no third‑party geocoder in MVP.
- E2E tests are optional for MVP; ensure manual test checklist is exhaustive if skipping automated e2e.

---

## Work Breakdown (Checklist)

1. Foundation & Tooling
   - Init Next.js, TS strict, ESLint/Prettier, Tailwind, shadcn.
   - Scripts and `.env.example`.
2. Data Layer
   - `types/db.ts`, `lib/mongo.ts` (reuse), `admin/init` indexes + seed.
   - Repositories for plans, gardeners, links, assignments, submissions.
3. Utilities
   - `crypto.ts`, `cookies.ts`, `dates.ts`, `csv.ts`.
4. Validators
   - Zod schemas per spec; shared parsing helpers.
5. API
   - Public: resolve, assignments (GET/POST/DELETE), submission (submit/revert).
   - Admin: login, overview (+csv), links/create, lock/unlock, remind, init.
   - Rate limit helper + `ratelimits` collection.
6. UI Foundations
   - Layout, globals, redirect, Toaster, RTL.
7. Public Plan Page
   - Table, row component, paste dialog, month picker, localStorage draft, import prev month, submit/revert.
8. Admin
   - Login page + session cookie; `AdminGuard`.
   - Dashboard KPIs + table filters; actions; CSV.
9. Docs
   - README and envs; Vercel deploy guide.
10. Quality
   - A11y, performance, manual QA, optional tests.

---

## Estimates (Very Rough, person‑days)

- Foundation & Tooling: 0.5
- Data Layer + Indexes + Seed: 1.5
- Utilities: 0.5
- Validators: 0.3
- API Layer: 2.0
- UI Foundations: 0.5
- Public Plan Page: 2.0
- Admin Auth & Guard: 0.5
- Admin Dashboard: 1.5
- Docs & Deploy: 0.5
- QA/Perf/A11y: 0.7
- Buffer: 0.5
- Total: ~11.0 person‑days

---

## Manual Test Plan (Happy Paths)

- Init & Seed: Call `/api/admin/init`; verify collections and indexes.
- Admin Login: Wrong creds → error; correct creds → dashboard.
- Create Plan Links: Receive mapping, copy a gardener link.
- Public Fill: Open link, add rows, paste bulk, import prev, save draft, submit.
- Lock/Unlock: Lock plan → public becomes read‑only; unlock → editable.
- Overview & CSV: Verify KPIs and download CSV that opens in Excel (Hebrew text preserved).

---

## Environment Variables

```
MONGODB_URI=...
MONGODB_DB=amit-form
NEXT_ADMIN_EMAIL=admin@example.com
NEXT_ADMIN_PASSWORD=supersecret
CRYPTO_TOKEN_SALT=change_me_long_random
SESSION_SECRET=another_long_random_for_cookie_signing
```


