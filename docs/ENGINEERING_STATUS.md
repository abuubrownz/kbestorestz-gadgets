# Engineering status & alignment

> Single source of truth for the CTO and every coding agent working on this repository.
> Update the **Now / Next / Blocked** section at the end of each working session.
>
> Last verified: **2026-11-09** · branch `feat/rbac-foundation` (from `fd63d63`) · verified by an AI coding agent.

---

## 1. What this system is

KBestoreTZ is a technology retail + device repair platform for Tanzania. The repository is a
working **prototype** of the full ecosystem, not a finished shop:

| Experience | Route | State |
| --- | --- | --- |
| Public storefront | `/`, `/products`, `/products/$productId` | Built, sample catalogue |
| Cart & checkout | `/cart`, `/checkout` | Built, in-memory only |
| Repair booking & tracking | `/repairs`, `/repairs/book`, `/repairs/track` | Built, in-memory only |
| Customer account | `/account` | Built, sample activity |
| Technician workspace | `/technician` | Built, sample tickets |
| Admin console | `/admin/*` | Built, sample business data |
| Auth | `/login`, `/reset-password` | **Real** Supabase Auth + phone MFA |

## 2. Verified state of the system

Commands were run on the CTO's Windows machine from the repository root.

| Check | Command | Result |
| --- | --- | --- |
| Production build | `bun run build` | ✅ passes (Vite + Nitro/Cloudflare output in `.output/`) |
| TypeScript | `node node_modules/typescript/bin/tsc --noEmit` | ✅ passes — 5 errors fixed in this session (see §7) |
| ESLint | `bun run lint` | ⚠️ 477 formatting errors in 44 files + 10 fast-refresh warnings. **Zero real code-rule errors.** All 477 are `prettier/prettier` and auto-fixable. |
| Demo mode | `src/components/kb/demo-notice.tsx` | `DEMO_MODE = true` — orders and bookings are not stored |

The 477 formatting errors are pre-existing; the repository has never had a repo-wide Prettier run.
CI keeps `lint` report-only for that reason. The earlier 12,994 CRLF errors were reduced by setting
Prettier `endOfLine: "auto"` and adding `.gitattributes`.

**Windows note:** PowerShell blocks `npx.ps1` on this machine. Use `bun run <script>` or call
`node node_modules/<tool>/...` directly.

## 3. Architecture map

- **Framework:** TanStack Start (React 19, Vite 8, file-based routing) — *not* Next.js.
- **Routing:** `src/routes/*.tsx`; root shell in `src/routes/__root.tsx`;
  `src/routeTree.gen.ts` is generated — never edit by hand.
- **UI:** Tailwind CSS 4 + shadcn/ui primitives in `src/components/ui`; product-specific
  components in `src/components/kb`; design tokens in `src/styles.css`.
- **Auth:** `src/lib/auth.tsx` — Supabase email/password, email confirmation, AAL2 phone MFA.
  Active roles (`super_admin`, `admin`, `finance_officer`, `store_manager`, `technician`, `customer`)
  come from `public.user_role_assignments` joined with `public.roles`, never from the client.
- **Authorization model:** `docs/RBAC.md` — six roles, permission catalogue, branch scope, grant
  ceilings, conflict rules and the migration runbook. Route guards are UX only; RLS is the boundary.
- **Route guards:** `src/components/kb/require-role.tsx`. Guards only hide UI; **RLS is the real
  security boundary.**
- **Cart:** `src/lib/cart.tsx` — `localStorage`, key `kbestoretz.cart`.
- **Data:** `src/lib/data.ts` — the sample catalogue, orders, repairs, technicians and reviews.
  Every business screen imports from here.
- **SMS:** Supabase Send SMS Hook → `supabase/functions/send-sms-hook` → Africa's Talking.
- **Sitemap/SEO:** `src/lib/sitemap.ts` + `src/routes/sitemap[.]xml.ts`; routes opt in with
  `staticData.sitemap`. Staff pages are `noindex` and excluded.
- **Deployment:** Cloudflare target via Nitro; also connected to Lovable for previews/editor sync.

## 4. Real vs. sample — do not confuse them

**Real (persisted/security-relevant):**
- Supabase Auth accounts, email confirmation, password reset.
- `public.profiles` and `public.user_roles` with RLS.
- Phone MFA enrollment/challenge/verify and the SMS hook adapter.
- Role-based route guards; sitemap generation; local cart.

**Sample / in-memory (refresh resets):**
- Products and prices (also duplicated in the not-yet-applied catalogue SQL).
- Orders, order tracking, checkout submission.
- Repair bookings, tickets, timelines, technician notes, parts.
- Inventory, suppliers, customers, analytics, appointments, warranties, loyalty.
- Admin and technician edits.

**Written but NOT applied to Supabase:**
- `supabase/migrations/20261028120000_auth_roles_profiles.sql` (auth tables/roles)
- `supabase/migrations/20261028130000_require_aal2_for_roles.sql` (superseded by the RBAC access
  migration — do not apply it after RBAC)
- `supabase/migrations/20261109120000_rbac_schema.sql` (branches, roles, permissions, assignments)
- `supabase/migrations/20261109121000_rbac_seed.sql` (six roles, 50 permissions, grant ceilings)
- `supabase/migrations/20261109122000_rbac_access.sql` (helpers, RLS, audit, role guard, cutover)
- `supabase/migrations/20261028150000_catalogue_products_images.sql` (on `feat/catalogue-db`)

Applying a migration is a **CTO decision**. Never apply one automatically. The RBAC files are
written and reviewed but have **not** been executed against any database.

## 5. Branch map (as fetched on 2026-10-29)

| Ref | Commit | Relationship | Disposition |
| --- | --- | --- | --- |
| `origin/main` | `3a349b9` | Canonical base | Target for all merges |
| `feat/real-auth` (HEAD) | pushed | Contains the auth/phone-MFA work (`ae6dbde`), the alignment commits, and a parallel CI commit (`49b1543`); contains `origin/main` | Review and merge to `main` via PR |
| `origin/feat/catalogue-db` | `74ff825` | Sibling of HEAD (branches at `aacf7aa`); SQL + docs only | Rebase after auth merges, then PR |
| `origin/feat/contact-details` | `86d0f8d` | Independent branch from `origin/main`; contact details/locations | Merge independently |
| local `main` | `216314b` | **Diverged** from `origin/main` (ahead 1, behind 2) | Do not merge into `origin/main`; reset local `main` to `origin/main`, keep `216314b` on `feat/my-changes` |
| `origin/feat/my-changes`, `my-work-backup` | `216314b` | PR template + instructions | Decide whether to keep; do not merge its lineage wholesale |
| `origin/chore/phase-0-stabilize` | `de056ee` | Already an ancestor of `origin/main` | Done |
| `origin/feat/admin-role-access` | `bd142cd` | Already an ancestor of `origin/main` | Done |
| `origin/feat/storefront-redesign` | `196610f` | Already merged into `origin/main` | Done |
| `refs/agents/...` | various | Automatic agent checkpoints (snapshots) | **Never merge, push or deploy** |

**Resolved risk:** the phone-MFA work (`ae6dbde`, originally `b101237`) previously existed only on
the CTO's machine. It was pushed on 2026-10-29 together with this alignment commit.

## 6. Working agreement for the CTO and all coding agents

These rules exist so that Claude, ChatGPT, OpenCode and any future agent produce one coherent
system instead of four competing ones.

**Source of truth**
1. This file is the status/decision log. Code and SQL are the implementation.
2. `AGENTS.md` holds the non-negotiable rules; read it first.
3. `docs/AUTH_SETUP.md` and `docs/CATALOGUE_SETUP.md` are the operational runbooks.
4. Do not re-litigate settled architecture in a PR. Propose a short ADR-style note instead
   (context → decision → consequences) and let the CTO decide.

**Branch & git discipline**
5. One workstream = one branch = one pull request. Never mix unrelated fixes.
6. `main` must always build. CI `build` is blocking.
7. Never rewrite published history (no force-push, rebase, amend or squash of pushed commits).
   Lovable mirrors this repository; rewriting loses project history.
8. Never merge `refs/agents/...` checkpoint refs. Before pushing, fetch; if the remote moved, rebase
   only your **unpushed** commits and retry — never force-push.

**Safety boundaries (require explicit CTO approval)**
9. Applying database migrations, changing RLS policies, or deleting business data.
10. Deploying, changing production env/secrets, or enabling live SMS/email/payments.
11. Changing auth, personal-data handling, pricing, or anything that affects real customers.
12. Resetting/rebasing shared branches or deleting branches.

**Definition of done for any change**
13. `bun run build` passes and TypeScript passes.
14. New/changed behaviour is exercised (manually or with a test) and described in the PR.
15. Any new database table has least-privilege RLS and a migration file; it is not applied.
16. Docs updated: this file's Now/Next/Blocked block, plus any runbook affected.
17. No secrets in code, commits, chat or screenshots. Use `.env`/Supabase secrets only.

**Handoff protocol (end of every session)**
18. State the branch, commit, commands run, and exact result.
19. Write what changed, what is unverified, and what the next agent should do first.
20. Leave the working tree either clean or with an explicit description of every uncommitted file.

## 7. Changes made during this alignment session

- Fixed 5 TypeScript errors in `src/routes/products.index.tsx` (index-signature access under
  `noPropertyAccessFromIndexSignature`). Typecheck now passes.
- Added `endOfLine: "auto"` to `.prettierrc` so Windows (CRLF) and Linux (LF) agents agree.
- Added `.gitattributes` to normalise the repository to LF and mark binary assets.
- Added this document and expanded `AGENTS.md` with the working agreement.
- Integrated a remote CI commit (`49b1543`) authored by a parallel Claude session. The two local
  commits were rebased on top of it and pushed without force (`49b1543..a76823a`).
- Made CI `typecheck` blocking (it now passes); `lint` stays report-only until the format sweep.

## 8. Rational delivery sequence

**Phase 1 — consolidate (days, not weeks)**
1. Push `feat/real-auth`, open a PR, review and merge to `main`.
2. Merge `feat/contact-details` (small, independent).
3. Reset local `main` to `origin/main`; retire or rebase the stale `my-changes` lineage.
4. Rebase `feat/catalogue-db` on the new `main` and merge the SQL + runbook (still not applied).
5. After the merge queue is empty, run one repo-wide `bun run format` as a **single isolated
   commit** so the 477 formatting errors stop masking real lint findings.

**Phase 2 — real catalogue**
6. Apply the catalogue migration (CTO approval) and wire `/products`, `/products/$productId` and
   `/admin/products` to Supabase, with image upload to the photo bucket.

**Phase 3 — orders**
7. Add `orders` / `order_items` tables + RLS, real checkout, stock decrement, customer order list
   and order tracking. Remove `DEMO_MODE` only when both order and booking writes are live.

**Phase 4 — repairs**
8. Add repair tickets, stage timeline, technician assignment, notes, parts and completion reports;
   connect booking, tracking, technician and admin repair screens.

**Phase 5 — operations**
9. Real inventory/suppliers, customer CRM, analytics driven by the database, loyalty and warranty.

**Phase 6 — launch hardening**
10. Live SMS sender ID and SMTP, payment provider (e.g. M-Pesa), backups, monitoring, PDPA 2022
    privacy review, staff training, and a recovery path for lost phone numbers.

## 9. Decisions needed from the CTO

1. ~~Push `feat/real-auth`~~ — done 2026-10-29. Remaining: approve opening the PR to `main`.
2. Approve resetting the **local** `main` to `origin/main` (keeps `216314b` on `feat/my-changes`).
3. Approve the one-time repo-wide Prettier sweep once the merge queue is clear.
4. Catalogue policy: should technicians change prices, or only stock and photos?
5. Next workstream after Phase 1: **catalogue persistence** or **orders/checkout**?

## 10. Session log �?" 2026-10-30: live category cards, shared catalogue, logo

**Shipped on `feat/real-auth` (uncommitted at time of writing):**

- Added `src/lib/catalogue.tsx`: one shared catalogue provider (seed = `src/lib/data.ts`, persisted
  to `localStorage` under `kbestoretz.catalogue.v1`). Admin edits, technician stock changes, the
  homepage, `/products`, product detail and the cart all read the same list. This is the seam where
  the Supabase catalogue migration plugs in later — no UI changes needed.
- Homepage category cards now show real products (top two by reviews, live price and starting price)
  and derive their counts from the catalogue instead of the hard-coded `cat.items` values.
- `/admin/products` now writes to the shared catalogue and has inline stock +/- controls. Edits are
  visible on the storefront immediately.
- Technician workspace gained a **Parts & product stock** panel: search, low-stock highlighting and
  +/- stock adjustments, sorted lowest-first with a “Show all N products” toggle. Technicians do
  **not** edit prices; that stays admin-only.
- `/products` filters (brand list, price ceiling) and `/products/$productId` now come from the shared
  catalogue. Out-of-stock products can no longer be added to the cart.
- Replaced the placeholder `KB` tile with the supplied logo: cropped and keyed to transparency into
  `src/assets/brand/kbestoretz-mark.png` (header/footer) and `src/assets/brand/kbestoretz-logo.png`
  (login panel). The mark sits in the existing dark `ink-panel` tile so white artwork stays legible.

**Verified:** `bun x tsc --noEmit` passes; `bun run build` passes (client + SSR + Nitro).

**Not verified / still sample data:** catalogue edits persist per browser via localStorage, not in
Supabase. Clearing storage restores the seed catalogue. Multi-device sync and image upload still
need the catalogue migration (CTO approval) and a real photo bucket.

### 2026-11-02: welcome screen, auth panels, link rationalisation

- Added `src/components/kb/welcome-dialog.tsx` and mounted it in `PublicShell`: a first-visit
  welcome dialog with the brand lockup and the essentials (genuine devices + warranties, tracked
  certified repairs, delivery/locations), plus CTAs to `/products`, `/repairs/book` and
  `/repairs/track`. Seen state is stored under `kbestoretz.welcome.v1`; the footer
  **About KBestoreTZ** button re-opens it via a DOM event.
- `/login` left panel is now tab-aware: **Sign in** explains what returning customers can see and do
  (orders, warranties, live repair stages, email/SMS alerts, phone-code security) and links to
  guest repair tracking; **Create account** explains what sign-up involves (email + phone
  verification, ~1 minute, no card details) and links to guest booking.
- Link rationalisation: footer social placeholders (`href="#"`) replaced with working WhatsApp,
  `mailto:` and Google Maps links; locations now open Google Maps; the plain-text support email is a
  `mailto:` link; contact constants centralised in `src/lib/contact.ts`.
- Homepage hero gained utility links to repair tracking, account orders/warranties and WhatsApp.
  Removed the unverifiable “Join 9,000+ subscribers” newsletter claim.

**Verified:** `bun x tsc --noEmit` passes; `bun run build` passes; dev server returns 200 on `/`,
`/products`, `/products/iphone-15-pro`, `/login`, and SSR output contains the new links.

**Not verified:** the welcome dialog itself is client-only (opens from `useEffect`), so it could not
be screenshot-verified without the in-app browser. Please confirm it appears on a fresh browser
profile and stays dismissed afterwards.

### 2026-11-02: member access — wishlist + account-gated checkout

**Access model now:** guests can browse the catalogue, compare products, use the cart and book/track
repairs. Checkout, order history, warranties and the wishlist require an account.

- New `src/lib/wishlist.tsx`: `WishlistProvider` stores saved product ids per signed-in user
  (`kbestoretz.wishlist.<userId>`), clears on sign-out, and exposes `has/toggle/remove/clear`.
  Mounted in `__root.tsx` inside `AuthProvider`.
- `ProductCard` gained a heart button. Guests get a toast with a **Sign in** action that returns them
  to the page they were on after login; signed-in users save/unsave instantly.
- Header shows a wishlist icon with a live count for signed-in users and deep-links to
  `/account?tab=saved`.
- `/account` now has a **Saved** tab and a live “Saved products” overview card (empty state links to
  the store). `/account` accepts `?tab=` so links can open a specific tab.
- `/checkout` is wrapped in `RequireRole`: guests get the sign-in prompt with `redirect=/checkout`
  (cart survives because it is stored locally), and the contact step is pre-filled from the account
  name/email.
- Account banner now states clearly which data is sample (orders/repairs/points) and that the
  wishlist is real.

**Verified:** `bun x tsc --noEmit` passes; `bun run build` passes; SSR renders the heart control on
product cards and the sign-in gate on `/checkout`.

**Next in scope (unblocked):** move repair bookings into a shared store so a signed-in booking
appears under account → Repairs. **Blocked on CTO approval:** persisting catalogue, orders and
wishlists in Supabase (migrations).

---

### 2026-11-02: forgot-password view + sign-up phone OTP clarity + SMS provider choice

- `/login` now has a dedicated **Reset your password** view, reachable from both the sign-in form and
  the registration form. It sends the Supabase one-time email link to `/reset-password`, shows the
  same neutral confirmation whether or not the address exists, rate-limits resends (60s), and offers
  a WhatsApp support route for customers who no longer use the registered email. The left-hand panel
  switches to account-recovery copy while the form is open.
- Registration now keeps the normalised phone number through the “Check your email” step and shows
  it masked (`+255 713 ••• 116`) in a three-step notice. The phone field explains that the SMS code
  is sent when the email is confirmed.
- Phone MFA screen now names the number, states that it is the number from sign-up, explains the
  one-time-code field, and disables **Send a new code** for 45 seconds after a successful resend to
  stay inside Supabase Auth rate limits. A support link covers a wrong number.
- **Why the OTP is not sent on submit:** Supabase email+password sign-up returns no session until
  the confirmation link is opened. The confirmation link creates the session, the app enrols the
  phone factor and the SMS hook sends the code. This is documented in `docs/AUTH_SETUP.md`; do not
  disable email confirmation just to move the SMS earlier without CTO sign-off.
- **Forgot password stays email-only** because Supabase password recovery does not support phone OTP
  without adding a phone identity (a new auth method). The UI does not imply an SMS reset exists.

**SMS provider recommendation (Tanzania):** Beem Africa is the cheapest published local option found
— **TZS 20** per SMS for 1–10,000, falling to TZS 12 at 500k–1M, with sender-ID registration. Twilio
quotes **USD 0.4336** per segment for Tanzania (Oct 2026), roughly 50–60× more. Africa's Talking is
already wired into `supabase/functions/send-sms-hook`; keep it for the pilot (free sandbox) and add a
Beem branch when production volume justifies sender-ID approval. For zero-cost testing use Supabase
test phone numbers with fixed OTPs. Full comparison is in `docs/AUTH_SETUP.md` §3.

**Verified:** `bun x tsc --noEmit` passes; `/login` returns 200 with the new reset entry point;
`bun run build` passes on the final tree. Committed and pushed as **`2b836be`** on `feat/real-auth`
(no history rewrite).

**Next in scope (unblocked):** repair bookings in a shared store so a signed-in booking appears under
account → Repairs. **Blocked on CTO approval:** SMS provider/sender-ID switch and production
credentials; persisted catalogue/orders/wishlists (migrations).

---

### 2026-11-03: unblock sign-in when phone MFA is not configured

Live checks against the connected Supabase project found why users could not complete a sign-in:

| Check | Result | Consequence |
| --- | --- | --- |
| `GET /auth/v1/settings` | `external.phone = false` | `mfa.enroll({ factorType: "phone" })` fails for every account |
| same call | `mailer_autoconfirm = false`, `sms_provider = twilio` | confirmation emails need real SMTP; SMS codes cannot be delivered until a provider + hook are configured |
| `GET /rest/v1/profiles`, `/rest/v1/user_roles` | HTTP 404 | `20261028120000_auth_roles_profiles.sql` is not applied; roles fall back to `customer` |

The auth provider treated any failure to start phone enrolment as a hard sign-in failure, so a
correct email/password still left the user without access. `src/lib/auth.tsx` now:

- attempts phone enrolment/challenge at AAL1 as before;
- if that fails **and the account has no verified phone factor**, logs a console warning and loads
  the user with email/password only;
- still fails closed when a **verified** phone factor exists but its challenge cannot start, so an
  established second factor cannot be bypassed.

Also widened the rate-limit copy to cover both login attempts and email sends.

**CTO setup still required** (cannot be applied from the repository):
1. Run `supabase/migrations/20261028120000_auth_roles_profiles.sql` in the Supabase SQL editor.
2. Enable the phone provider and the Send SMS hook (test numbers first), then apply
   `20261028130000_require_aal2_for_roles.sql`.
3. Configure real SMTP for confirmation/reset email and add the site + redirect URLs.
4. Grant staff roles with the SQL in `docs/AUTH_SETUP.md` §4–5.

**Verified:** `bun x tsc --noEmit` passes; the auth endpoint is reachable (an invalid password
returns `400`, as expected); `/login` and `/reset-password` return 200.

---

### 2026-11-04: Facebook sign-in + real users directory (pushed at `fd63d63`)

Two additions on top of `92ff3af`, committed and pushed to `feat/real-auth` as **`fd63d63`** on
2026-11-09 after Founder approval. The RBAC migration now moves the directory read to
`user_role_assignments` + `roles`.

**Facebook sign-in (Facebook only).**
- `src/lib/auth.tsx` gained `signInWithOAuth("facebook")` and a `provider_unavailable` error code,
  so a provider that is switched off maps to a helpful message instead of a generic failure.
- `/login` shows **Continue with Facebook** above the email tabs, separated by an “or use your
  email” divider. The button is rendered only when the project's public
  `GET /auth/v1/settings` reports `external.facebook === true`; a failed capability check never
  blocks email/password sign-in. The OAuth return path is `/login`, which forwards the user by role.
- **Why only Facebook:** Instagram is not a Supabase provider (needs a custom Meta OAuth backend),
  Telegram needs a custom Login Widget plus a signed Edge Function, and WhatsApp is a messaging
  channel, not an identity provider — “sign in with WhatsApp” is not possible. WhatsApp stays an
  OTP/notification channel. Social accounts carry no Tanzanian phone number, so they sign in with
  the provider plus email and skip phone MFA.
- Live check: `external.facebook = false` on the connected project, so the button stays hidden until
  a Meta app exists and the provider is enabled (steps in `docs/AUTH_SETUP.md` §2).

**Real users directory (admin only).**
- New `src/routes/admin.users.tsx` at **Admin console → Users & roles** (`/admin/users`). It reads
  `profiles` (name, phone, joined date) and `user_roles`, shows customer/technician/admin counts,
  role filter chips and a name/phone search. Guarded by `DashboardShell`, which defaults to
  `admin` only.
- When the tables are missing the page shows a setup card that names
  `20261028120000_auth_roles_profiles.sql` instead of an error; other failures show the message and
  a retry. No email column: addresses live in Supabase's protected `auth` schema and need an
  admin-only RPC before they can be shown.
- `src/components/admin/nav.ts` adds the `Users & roles` entry. The older `/admin/customers` page is
  still sample CRM data and is unchanged.

**Docs:** `docs/AUTH_SETUP.md` gained the Facebook section, the users-directory note and two new
troubleshooting rows.

**Verified:** `bun x tsc --noEmit` passes; `bun run build` passes and regenerated
`src/routeTree.gen.ts` with `/admin/users`; `/login` and `/admin/users` return 200 from the dev
server; the auth settings endpoint allows the `apikey` header from the browser origin (CORS `*`).

**Not verified:** Facebook end-to-end (provider disabled, no Meta app) and the populated directory
(tables 404 until the migration is applied). The in-app browser is disconnected, so there are no
screenshots.

---

### 2026-11-09: enterprise RBAC foundation (written, NOT applied)

Founder approved the Phase 1 RBAC architecture and its ten defaults. The Facebook + `/admin/users`
slice was committed and pushed first, on `feat/real-auth` at **`fd63d63`**. This work is on a new
branch, **`feat/rbac-foundation`**, cut from that commit. Approval covered **writing migration files
only** — no Supabase project was changed.

**Database (three new migrations, in apply order after `20261028120000`):**

- `20261109120000_rbac_schema.sql` — `branches`, `roles`, `permissions`, `role_permissions`,
  `role_assignment_rules`, `role_conflict_rules`, `user_role_assignments`, `staff_profiles`,
  `approval_limits`, `role_assignment_requests`, `audit_logs`. Active-assignment partial unique
  index; soft revocation; append-only audit shape.
- `20261109121000_rbac_seed.sql` — six roles (`customer`, `technician`, `store_manager`, `admin`,
  `finance_officer`, `super_admin`), 50 permissions, the role matrix, grant ceilings, and the two
  high-risk conflict pairs (`admin`/`store_manager` + `finance_officer`). Idempotent.
- `20261109122000_rbac_access.sql` — `app`-schema helpers (`current_roles`, `is_super_admin`,
  `has_permission`, `has_permission_any_branch`, `has_cross_branch`, `can_access_branch`), RLS on
  every new table, AAL2 profile rules, audit triggers, the role-assignment guard (no self-assignment,
  no grant above rank, last Super Admin protected), the legacy `user_roles` migration, and the
  replacement `public.has_role` / `public.handle_new_user`.

**Client:**

- `src/lib/auth.tsx` now reads active assignments from `user_role_assignments` + `roles`, exposes all
  six roles, keeps `roles: Role[]`, and treats a `super_admin` as universal for UI guards. Staff
  without a dedicated dashboard (`finance_officer`, `store_manager`) land on `/account` for now.
- `src/components/kb/require-role.tsx` checks the role set via `hasRole`; `/account` and `/checkout`
  use the exported `allRoles`.
- `src/routes/admin.users.tsx` lists live accounts with multi-role badges for all six roles and shows
  the four-migration setup card until the tables exist.
- `src/integrations/supabase/types.ts` replaces `user_roles` with `roles` and
  `user_role_assignments`.

**Docs:** `docs/RBAC.md` is the design of record (principles, role matrix, branch model, authz flow,
route targets, RLS summary, runbook, audit, open decisions). `docs/AUTH_SETUP.md` now lists the exact
migration order, bootstrap Super Admin SQL, branch staff grants, the directory behaviour and
troubleshooting rows. The older `20261028130000` AAL2 migration is documented as superseded.

**Verified:** `bun x tsc --noEmit` passes; `bun run build` passes; the SQL has not been executed
(no database was touched), so RLS and trigger behaviour are unverified.

**Not verified:** the migrations themselves, a populated `/admin/users`, and all staff data reads
(staff-wide reads require AAL2, and phone MFA is still unavailable). The in-app browser is
disconnected, so there are no screenshots.

---

## Now / Next / Blocked

- **Now:** RBAC foundation is written on `feat/rbac-foundation` (from `fd63d63`), verified by
  tsc/build and awaiting CTO preview/commit. Migration files are complete but **not applied**.
- **Next:** CTO reviews the RBAC diff; then apply `20261028120000` → RBAC schema → seed → access with
  a backup and rollback plan, and bootstrap two Super Admins. After that, build the server-side
  authorization layer (`requirePermission`, AAL2, branch scope) and add `/manager`, `/finance`,
  `/super-admin`. Separately, move repair bookings into a shared store so a signed-in booking appears
  under account → Repairs.
- **Blocked:** RBAC migrations need CTO sign-off, a database backup and working phone MFA (staff
  reads require AAL2). Phone MFA is unavailable (`external.phone=false`), Facebook is disabled
  (`external.facebook=false`), and `mailer_autoconfirm=false`. Live tables still 404: `profiles`,
  `user_roles`, `products`, `orders`, `repairs`, `inventory`, `branches`, `user_role_assignments`
  (post-migration). Custom SMTP, SMS provider/sender ID/Edge Function secrets, and the Meta app are
  still missing. Vercel is unconfigured (`cloudflare-module` output, no `vercel.json`). Refund approval
  amounts and the canonical branch list (and branch seed data) remain Founder/CTO inputs.
