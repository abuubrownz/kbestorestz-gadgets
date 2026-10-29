# Engineering status & alignment

> Single source of truth for the CTO and every coding agent working on this repository.
> Update the **Now / Next / Blocked** section at the end of each working session.
>
> Last verified: **2026-10-29** · branch `feat/real-auth` @ `b101237` · verified by an AI coding agent.

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
| `feat/real-auth` (HEAD) | `b101237` | **+1 unpushed commit** on top of `origin/feat/real-auth`; contains `origin/main` | Push, review, merge to `main` |
| `origin/feat/real-auth` | `aacf7aa` | Auth work before phone MFA | Superseded by HEAD |
| `origin/feat/catalogue-db` | `74ff825` | Sibling of HEAD (branches at `aacf7aa`); SQL + docs only | Rebase after auth merges, then PR |
| `origin/feat/contact-details` | `86d0f8d` | Independent branch from `origin/main`; contact details/locations | Merge independently |
| local `main` | `216314b` | **Diverged** from `origin/main` (ahead 1, behind 2) | Do not merge into `origin/main`; reset local `main` to `origin/main`, keep `216314b` on `feat/my-changes` |
| `origin/feat/my-changes`, `my-work-backup` | `216314b` | PR template + instructions | Decide whether to keep; do not merge its lineage wholesale |
| `origin/chore/phase-0-stabilize` | `de056ee` | Already an ancestor of `origin/main` | Done |
| `origin/feat/admin-role-access` | `bd142cd` | Already an ancestor of `origin/main` | Done |
| `origin/feat/storefront-redesign` | `196610f` | Already merged into `origin/main` | Done |
| `refs/agents/...` | various | Automatic agent checkpoints (snapshots) | **Never merge, push or deploy** |

**Highest-risk fact:** `b101237` (the phone-MFA work) exists only on this machine. If the laptop is
lost or another agent is used, that work disappears. Push it before starting anything else.

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
8. Never merge `refs/agents/...` checkpoint refs.

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

1. Approve pushing `feat/real-auth` and opening the PR today (protects the only copy of the MFA work).
2. Approve resetting the **local** `main` to `origin/main` (keeps `216314b` on `feat/my-changes`).
3. Approve the one-time repo-wide Prettier sweep once the merge queue is clear.
4. Catalogue policy: should technicians change prices, or only stock and photos?
5. Next workstream after Phase 1: **catalogue persistence** or **orders/checkout**?

---

## Now / Next / Blocked

- **Now:** Phase 1 consolidation; auth branch ready to push and review.
- **Next:** merge contact details, rebase catalogue, then choose Phase 2 or Phase 3.
- **Blocked:** live ordering/booking (needs schema + CTO approval); real SMS (needs Africa's
  Talking credentials and sender ID); production email (needs SMTP provider).
