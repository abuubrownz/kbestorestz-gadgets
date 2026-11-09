# RBAC architecture (KBestoreTZ)

Status: **design approved; database migrations written but NOT applied**. Nothing in this
document changes the live Supabase project until the migrations in §9 are run with CTO approval.

Source of truth for the permission model. It follows the Phase 1 architecture approved on
9 November 2026.

## 1. Principles

1. A **role** is a job function; a **permission** is a capability. Route and data access are decided
   by permissions, never by a role name in client code.
2. **Deny by default.** No role assignment or no matching permission means no access.
3. The browser gets a role/capability snapshot for UI only. Every sensitive action is re-authorized
   on the server.
4. **RLS is the final boundary.** A missed route guard or a tampered client cannot read or write
   rows outside policy.
5. **Branch scope is part of authorization.** A permission without valid branch scope is not access.
6. Multi-role is additive. A user gets the union of their active roles, still subject to
   separation-of-duties checks.
7. **No self-escalation.** Nobody assigns themselves a role, branch or approval.
8. Privileged actions are audited.

## 2. Roles

| Code | Name | Default scope | Purpose |
|---|---|---|---|
| `customer` | Customer | Self | Own account, orders, invoices, repairs, warranties, payments |
| `technician` | Technician | Assigned branch + assigned tickets | Diagnosis, estimates, parts, status, quality checks |
| `store_manager` | Store Manager | One branch | Branch inventory, orders, repairs, staff supervision, branch reports |
| `admin` | Administrator | One branch (global only by Super Admin grant) | Daily operations, catalogue, orders, repairs, limited staff admin |
| `finance_officer` | Finance Officer | One branch (global for reconciliation by grant) | Payment verification, invoices, refunds within limits, reconciliation |
| `super_admin` | Super Admin | Global | Staff, roles, security, branches, integrations, global reporting, audit |

Every account also holds `customer`, so staff keep self-service access to their own orders and
repairs.

Ranks: customer 10, technician 20, store manager 30, admin/finance 40, super admin 100. Rank is a
secondary control; the explicit grant rules in `role_assignment_rules` decide what an actor may
assign.

## 3. Permission catalogue

Format: `<resource>.<action>[.<qualifier>]`. Lowercase snake_case. `manage` means create/update/
cancel within scope, never "manage permissions". `own` is always explicit.

### Customer baseline (granted to `customer`)

`account.read_own`, `account.update_own`, `orders.read_own`, `invoices.read_own`,
`payments.read_own`, `warranties.read_own`, `repairs.read_own`, `repairs.book_own`,
`repairs.track_own`.

`repairs.track_own` still requires the approved **reference number + OTP** flow; being signed in is
not proof of ownership.

### Role-permission matrix

`✓` = granted; `✓*` = scoped by branch, assigned ticket, or approval limit.

| Permission | Technician | Admin | Store Manager | Finance | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| `customers.read` | — | ✓ | ✓ | ✓ | ✓ |
| `customers.update` | — | ✓ | ✓ | — | ✓ |
| `products.read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `products.create` | — | ✓ | — | — | ✓ |
| `products.update` | — | ✓ | — | — | ✓ |
| `inventory.read` | ✓ | ✓ | ✓ | — | ✓ |
| `inventory.adjust` | — | ✓ | ✓ | — | ✓ |
| `inventory.transfer` | — | ✓* | — | — | ✓ |
| `orders.read` | — | ✓ | ✓ | ✓ | ✓ |
| `orders.manage` | — | ✓ | ✓ | — | ✓ |
| `repairs.read` | ✓* | ✓ | ✓ | — | ✓ |
| `repairs.assign` | — | ✓ | ✓ | — | ✓ |
| `repairs.update_status` | ✓* | ✓ | ✓ | — | ✓ |
| `repairs.estimate.create` | ✓* | ✓ | ✓ | — | ✓ |
| `repairs.approve_estimate` | — | ✓ | ✓ | — | ✓ |
| `repairs.parts.manage` | ✓* | ✓ | ✓ | — | ✓ |
| `repairs.quality_check` | ✓* | ✓ | ✓ | — | ✓ |
| `warranties.read` | — | ✓ | ✓ | — | ✓ |
| `warranties.manage` | — | ✓ | ✓ | — | ✓ |
| `invoices.read` | — | ✓ | ✓ | ✓ | ✓ |
| `invoices.manage` | — | — | — | ✓ | ✓ |
| `payments.read` | — | ✓ | ✓ | ✓ | ✓ |
| `payments.verify` | — | — | — | ✓ | ✓ |
| `payments.reconcile` | — | — | — | ✓ | ✓ |
| `refunds.request` | — | ✓ | ✓ | ✓ | ✓ |
| `refunds.approve` | — | — | — | ✓* | ✓ |
| `refunds.process` | — | — | — | ✓ | ✓ |
| `reports.financial.read` | — | — | — | ✓ | ✓ |
| `reports.operational.read` | — | ✓ | ✓ | — | ✓ |
| `reports.global.read` | — | — | — | — | ✓ |
| `staff.read` | — | ✓ | ✓ | — | ✓ |
| `staff.manage` | — | ✓* | ✓* | — | ✓ |
| `roles.read` | — | ✓ | — | — | ✓ |
| `roles.assign` | — | ✓* | — | — | ✓ |
| `permissions.manage` | — | — | — | — | ✓ |
| `branches.read` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `branches.manage` | — | — | — | — | ✓ |
| `audit_logs.read` | — | — | — | — | ✓ |
| `system.settings.manage` | — | — | — | — | ✓ |
| `system.integrations.manage` | — | — | — | — | ✓ |
| `access.cross_branch` | — | — | — | — | ✓ |

Notes:

- Admin `roles.assign` is limited to `technician` and `store_manager`, within the admin's branch,
  never to self and never above the actor's rank.
- Finance `refunds.approve` is limited by `approval_limits`. A requester cannot approve their own
  refund. Amounts are still a Founder decision; the table exists but is unseeded.
- `staff.manage` covers employment records and schedules, not roles.
- `access.cross_branch` applies existing base permissions across branches; it grants no new base
  capability.

## 4. Multi-role and conflicts

`user_role_assignments` is the source of truth:

```text
id, user_id, role_id, branch_id (NULL = global), granted_by, granted_at,
expires_at, revoked_at, revoked_by, reason, approval_id
```

- Active means `revoked_at IS NULL` and not expired.
- A user may hold several roles, including the same role in different branches.
- Assignments are revoked, never deleted. A partial unique index prevents duplicate active grants
  for the same user/role/branch.
- Sensitive grants (`admin`, `finance_officer`, `super_admin`) require an approved
  `role_assignment_requests` row.
- `admin + finance_officer` and `store_manager + finance_officer` are flagged high-risk and require
  Super Admin approval.
- The last active Super Admin cannot be revoked.
- No user can assign a role to themselves. The database trigger
  `app.guard_user_role_assignment` enforces this for direct writes with a user JWT.

## 5. Branch model

- `branch_id = NULL` on a staff assignment means global and is Super Admin only.
- Branch-scoped staff act only in their branch. Store managers never get another branch by default.
- Branch-specific data will carry `branch_id`: inventory, orders, invoices, repairs, repair events,
  stock movements and staff home branch.
- Products stay global; stock is per `(branch_id, product_id)`.
- Cross-branch operations require the base permission **and** a global assignment or
  `access.cross_branch`, plus an audit record naming both branches.
- Customers are not branch-bound and may order from any branch.

## 6. Authorization flow

```text
Supabase Auth sign-in / OAuth / MFA
        ↓
Server verifies the session JWT
        ↓
Load active role assignments (roles + branch)
        ↓
Resolve effective permissions
        ↓
Route guard checks a permission (server-side; client guard is UX only)
        ↓
Server function checks permission + resource + branch + separation of duties
        ↓
User-scoped query → RLS enforces the final boundary
        ↓
Sensitive action → audit log
```

The JWT is trusted for identity (`sub`) and AAL, not for roles. Permissions are recomputed from the
database; a short-lived cache must be invalidated on assignment changes.

## 7. Route protection (target)

| Route | Access | Scope |
|---|---|---|
| `/account` | Any authenticated account | Self |
| `/technician` | `repairs.read` + `repairs.update_status` | Assigned branch + assigned ticket |
| `/admin` | `orders.read` + `customers.read` (or equivalent) | Assigned branch / global |
| `/manager` | `reports.operational.read` + (`orders.manage` or `inventory.adjust`) | Assigned branch only |
| `/finance` | `payments.verify` or `reports.financial.read` | Assigned branch / global |
| `/super-admin` | `roles.assign` + `permissions.manage` + `audit_logs.read` | Global |

The current `/admin` and `/technician` guards still check role names. They move to permission checks
when the server authorization layer lands. Until then they are UX only.

## 8. RLS and helpers

Helpers live in the `app` schema (not exposed through PostgREST):

- `app.current_roles()` – active role codes for `auth.uid()`.
- `app.is_super_admin()` – active Super Admin assignment.
- `app.has_cross_branch()` – active `access.cross_branch` grant.
- `app.has_permission(code, branch_id)` – branch-aware permission check. `branch_id = NULL` means a
  global-only action.
- `app.has_permission_any_branch(code)` – for non-branch resources such as approval limits.
- `app.can_access_branch(branch_id)`.

All are `SECURITY DEFINER` with a fixed `search_path`. RLS policies never trust client-supplied
roles or branch ids.

Policy summary:

| Table | Read | Write |
|---|---|---|
| `branches` | Active branches public; staff in scope | Service role / Super Admin only |
| `roles`, `permissions`, `role_permissions` | Authenticated | Service role / Super Admin only |
| `user_role_assignments` | Own rows; staff-wide at AAL2 with `staff.read` | No direct client writes |
| `staff_profiles` | Own or staff in branch at AAL2 | `staff.manage` in branch at AAL2 |
| `approval_limits` | Finance at AAL2; Super Admin | `permissions.manage` |
| `role_assignment_requests` | Target user or approver in scope | Requesters insert; Super Admin decides |
| `audit_logs` | Super Admin at AAL2 | Append-only; definer triggers only |

## 9. Migration runbook

Files:

1. `20261028120000_auth_roles_profiles.sql` — prerequisite (`profiles`, `has_role`).
2. `20261109120000_rbac_schema.sql` — tables and constraints.
3. `20261109121000_rbac_seed.sql` — roles, permissions, matrix, grant ceilings, conflicts.
4. `20261109122000_rbac_access.sql` — helpers, RLS, audit triggers, role guard, legacy cutover.

`20261028130000_require_aal2_for_roles.sql` is superseded: the RBAC access migration installs the
AAL2 profile rules and replaces `user_roles`. Do not apply it after step 4.

Do **not** run these against production until:

- the CTO has approved the migration diff;
- a database backup exists;
- phone MFA works for the first staff accounts (staff reads require AAL2);
- the verification queries below have been run on staging.

Verification after applying (run as the SQL editor owner):

```sql
-- six roles, 50 permissions
select count(*) from public.roles;            -- 6
select count(*) from public.permissions;      -- 50
select count(*) from public.role_permissions; -- 50 (super_admin) + role sets

-- no direct client writes to assignments
select has_table_privilege('authenticated', 'public.user_role_assignments', 'insert'); -- false

-- the old table is gone
select to_regclass('public.user_roles');      -- null
```

Bootstrap: see `docs/AUTH_SETUP.md` §4. Grant at least two global Super Admins.

## 10. Audit

`audit_logs` records actor, actor roles, action, resource, branch, before/after JSON, reason,
request id, IP/user agent, approval id and outcome. Triggers audit role assignments, branches and
role-permission changes. Updates and deletes are blocked by trigger, and clients have no write
grant.

Retention proposal: 7 years for financial records, at least 2 years for security events, subject to
legal review under Tanzania's Personal Data Protection Act 2022.

## 11. Open decisions

1. Refund approval amounts per role (required before `/finance` goes live).
2. Canonical branch list and whether stock is shared or per-branch (design assumes per-branch).
3. Whether an Admin may grant Store Manager/Technician, or all grants remain Super Admin only.
4. Whether high-risk combinations are flagged (current) or blocked outright.
5. AAL2 rollout: enable phone MFA before staff roles are granted.
6. Profile branch scoping: profiles are currently readable by any staff member at AAL2 because
   customers are not branch-bound. Revisit when customer/order branch ownership is defined.
