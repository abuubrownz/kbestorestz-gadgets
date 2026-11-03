# Engineering status & alignment

> Single source of truth for the CTO and every coding agent working on this repository.
> Update the **Now / Next / Blocked** section at the end of each working session.
>
> Last verified: **2026-11-03** · branch `feat/real-auth` (pushed at `f44fb6e`) · verified by an AI coding agent.

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
  Roles (`admin` / `technician` / `customer`) come from `public.user_roles`, never from the client.
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
- `supabase/migrations/20261028130000_require_aal2_for_roles.sql` (AAL2 on role data)
- `supabase/migrations/20261028150000_catalogue_products_images.sql` (on `feat/catalogue-db`)

Applying a migration is a **CTO decision**. Never apply one automatically.

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

## Now / Next / Blocked

- **Now:** the catalogue/member-access/auth slice is pushed at **`2b836be`** on `feat/real-auth`.
  The sign-in fallback for projects without phone MFA is pushed at **`f44fb6e`**. Sign-in with
  email/password works when the Supabase project has no phone provider; staff roles still require
  the auth migration plus phone MFA.
- **Next:** move repair bookings into a shared store so a signed-in booking appears under
  account → Repairs; then apply the catalogue migration and swap the localStorage providers for
  Supabase reads/writes.
- **Blocked:** live ordering/booking persistence (needs schema + CTO approval); production SMS
  delivery (needs an approved provider, sender ID and Edge Function secrets — Beem Africa recommended
  for cost, Africa's Talking adapter already present); production email (needs SMTP provider);
  staff role recognition (needs `20261028120000_auth_roles_profiles.sql` applied).
