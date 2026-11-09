-- KBestoreTZ: enterprise RBAC schema (Phase 1, part 1 of 3).
--
-- Design of record: docs/RBAC.md. Apply AFTER 20261028120000_auth_roles_profiles.sql,
-- because this model keeps `public.profiles` and extends the role model around it.
--
-- This migration is additive and safe to review without applying. It creates the
-- branch, role, permission, assignment, approval and audit tables. Seed data lives in
-- 20261109121000_rbac_seed.sql; helper functions, RLS and the legacy-table cutover live
-- in 20261109122000_rbac_access.sql.
--
-- Rules encoded here:
--   * A role assignment can be global (branch_id NULL) or scoped to one branch.
--   * Multiple roles per user are allowed; a user may hold roles in different branches.
--   * Revocation is soft (revoked_at), so history survives.
--   * Only Super Admin can create global assignments (enforced in the access migration).
--   * Audit rows are append-only and never cascade-delete with a user.

create schema if not exists app;

-- Shared updated_at trigger ------------------------------------------------------------
create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 1. Branches --------------------------------------------------------------------------
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9][a-z0-9-]{1,30}$'),
  name text not null check (length(btrim(name)) > 0),
  address text,
  phone text,
  timezone text not null default 'Africa/Dar_es_Salaam',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.branches is
  'Canonical KBestoreTZ branches. Stock, orders, repairs and staff assignments are scoped by branch_id.';

drop trigger if exists branches_set_updated_at on public.branches;
create trigger branches_set_updated_at
  before update on public.branches
  for each row execute function app.set_updated_at();

-- 2. Roles -----------------------------------------------------------------------------
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9_]{1,30}$'),
  name text not null,
  description text,
  rank integer not null check (rank between 0 and 1000),
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.roles is
  'Job functions. Permissions are attached to roles; routes and data checks use permissions, not role names.';

-- 3. Permissions -----------------------------------------------------------------------
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'),
  name text not null,
  description text,
  domain text not null,
  risk text not null default 'low' check (risk in ('low', 'medium', 'high', 'critical')),
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.permissions is
  'Fixed permission catalogue. Super Admin maps roles to these codes; arbitrary new codes are not created at runtime.';

-- 4. Role to permission mapping --------------------------------------------------------
create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

-- 5. Which roles each role may grant ---------------------------------------------------
create table if not exists public.role_assignment_rules (
  actor_role_id uuid not null references public.roles (id) on delete cascade,
  target_role_id uuid not null references public.roles (id) on delete cascade,
  requires_approval boolean not null default false,
  primary key (actor_role_id, target_role_id)
);

comment on table public.role_assignment_rules is
  'Explicit grant ceiling. Rank alone never authorises a grant; the pair must be listed here.';

-- 6. High-risk role combinations -------------------------------------------------------
create table if not exists public.role_conflict_rules (
  id uuid primary key default gen_random_uuid(),
  role_a_id uuid not null references public.roles (id) on delete cascade,
  role_b_id uuid not null references public.roles (id) on delete cascade,
  severity text not null default 'warn' check (severity in ('warn', 'block')),
  requires_super_admin boolean not null default true,
  created_at timestamptz not null default now(),
  unique (role_a_id, role_b_id),
  check (role_a_id <> role_b_id)
);

-- 7. Sensitive-role approval requests --------------------------------------------------
create table if not exists public.role_assignment_requests (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  branch_id uuid references public.branches (id) on delete restrict,
  requested_by uuid not null references auth.users (id) on delete cascade,
  requested_at timestamptz not null default now(),
  reason text not null check (length(btrim(reason)) >= 5),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'expired')),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  check (
    (status = 'pending' and decided_by is null and decided_at is null)
    or (status in ('approved', 'rejected') and decided_by is not null and decided_at is not null)
    or status = 'expired'
  )
);

create index if not exists role_assignment_requests_pending_idx
  on public.role_assignment_requests (requested_at desc)
  where status = 'pending';

-- 8. Refund / approval limits ----------------------------------------------------------
create table if not exists public.approval_limits (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references public.roles (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  permission_code text not null
    references public.permissions (code) on delete cascade on update cascade,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'TZS' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (role_id is not null or user_id is not null)
);

comment on table public.approval_limits is
  'Money limits per role or user. Amounts are minor units (TZS has no minor unit, so store whole shillings).';

drop trigger if exists approval_limits_set_updated_at on public.approval_limits;
create trigger approval_limits_set_updated_at
  before update on public.approval_limits
  for each row execute function app.set_updated_at();

-- 9. User role assignments -------------------------------------------------------------
create table if not exists public.user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  branch_id uuid references public.branches (id) on delete restrict,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users (id) on delete set null,
  reason text,
  approval_id uuid references public.role_assignment_requests (id) on delete set null,
  check (expires_at is null or expires_at > granted_at),
  check (revoked_at is null or revoked_at >= granted_at)
);

comment on table public.user_role_assignments is
  'Active role grants. branch_id NULL means global (Super Admin only). Revoke by setting revoked_at; never delete.';

create unique index if not exists user_role_assignments_active_unique
  on public.user_role_assignments (
    user_id,
    role_id,
    coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where revoked_at is null;

create index if not exists user_role_assignments_user_active_idx
  on public.user_role_assignments (user_id)
  where revoked_at is null;

create index if not exists user_role_assignments_branch_idx
  on public.user_role_assignments (branch_id);

create index if not exists user_role_assignments_role_idx
  on public.user_role_assignments (role_id);

-- 10. Staff employment records ---------------------------------------------------------
create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  employee_number text unique,
  job_title text,
  home_branch_id uuid references public.branches (id) on delete set null,
  employment_status text not null default 'active'
    check (employment_status in ('active', 'on_leave', 'suspended', 'ended')),
  hired_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists staff_profiles_set_updated_at on public.staff_profiles;
create trigger staff_profiles_set_updated_at
  before update on public.staff_profiles
  for each row execute function app.set_updated_at();

-- 11. Append-only audit log ------------------------------------------------------------
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_user_id uuid,
  actor_roles text[],
  action text not null,
  resource_type text not null,
  resource_id text,
  branch_id uuid references public.branches (id) on delete set null,
  before_state jsonb,
  after_state jsonb,
  reason text,
  request_id text,
  ip_address inet,
  user_agent text,
  approval_id uuid,
  outcome text not null default 'success' check (outcome in ('success', 'denied', 'error'))
);

comment on table public.audit_logs is
  'Append-only privileged-action history. No application role can update or delete rows; retention is a policy decision.';

create index if not exists audit_logs_occurred_at_idx
  on public.audit_logs (occurred_at desc);
create index if not exists audit_logs_actor_idx
  on public.audit_logs (actor_user_id, occurred_at desc);
create index if not exists audit_logs_resource_idx
  on public.audit_logs (resource_type, resource_id);
create index if not exists audit_logs_action_idx
  on public.audit_logs (action, occurred_at desc);
