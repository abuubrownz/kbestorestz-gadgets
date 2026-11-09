-- KBestoreTZ: RBAC access control (Phase 1, part 3 of 3).
--
-- Adds SECURITY DEFINER helpers, row-level security, audit triggers, the role-assignment
-- guard and the cutover from the legacy single-role `public.user_roles` table.
--
-- Prerequisite: 20261028120000_auth_roles_profiles.sql must be applied first (profiles,
-- app_role enum and public.has_role). This file replaces public.has_role with an
-- implementation backed by user_role_assignments, then drops public.user_roles.
--
-- The browser is never trusted. RLS is the final boundary; server functions must repeat
-- the permission and branch checks before using the service-role client.

-- 0. Prerequisite guard ----------------------------------------------------------------
do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Apply 20261028120000_auth_roles_profiles.sql before the RBAC migrations';
  end if;
  if to_regclass('public.roles') is null then
    raise exception 'Apply 20261109120000_rbac_schema.sql before the RBAC access migration';
  end if;
  if not exists (select 1 from public.roles where code = 'super_admin') then
    raise exception 'Apply 20261109121000_rbac_seed.sql before the RBAC access migration';
  end if;
end;
$$;

-- 1. Helper functions ------------------------------------------------------------------
-- All helpers are SECURITY DEFINER so RLS policies can read the assignment tables
-- without recursing into their own policies. search_path is fixed.

create or replace function app.current_roles()
returns text[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(array_agg(distinct r.code order by r.code), '{}'::text[])
  from public.user_role_assignments ura
  join public.roles r on r.id = ura.role_id
  where ura.user_id = auth.uid()
    and ura.revoked_at is null
    and (ura.expires_at is null or ura.expires_at > now());
$$;

create or replace function app.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    where ura.user_id = auth.uid()
      and r.code = 'super_admin'
      and ura.revoked_at is null
      and (ura.expires_at is null or ura.expires_at > now())
  );
$$;

-- True when the user holds access.cross_branch anywhere. Grants no new capability.
create or replace function app.has_cross_branch()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    join public.permissions p on p.id = rp.permission_id
    where ura.user_id = auth.uid()
      and p.code = 'access.cross_branch'
      and ura.revoked_at is null
      and (ura.expires_at is null or ura.expires_at > now())
  );
$$;

-- Branch-aware permission check. `_branch_id = NULL` means a global-only action
-- (for example audit logs or branch configuration).
create or replace function app.has_permission(_permission text, _branch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    join public.permissions p on p.id = rp.permission_id
    where ura.user_id = auth.uid()
      and p.code = _permission
      and ura.revoked_at is null
      and (ura.expires_at is null or ura.expires_at > now())
      and (
        ura.branch_id is null
        or (_branch_id is not null and ura.branch_id = _branch_id)
        or app.has_cross_branch()
      )
  );
$$;

-- Permission check that ignores branch scope. Use only for non-branch resources such
-- as approval limits, where a finance officer still needs to see their own limit.
create or replace function app.has_permission_any_branch(_permission text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.role_permissions rp on rp.role_id = ura.role_id
    join public.permissions p on p.id = rp.permission_id
    where ura.user_id = auth.uid()
      and p.code = _permission
      and ura.revoked_at is null
      and (ura.expires_at is null or ura.expires_at > now())
  );
$$;

create or replace function app.can_access_branch(_branch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select app.has_cross_branch() or exists (
    select 1
    from public.user_role_assignments ura
    where ura.user_id = auth.uid()
      and ura.revoked_at is null
      and (ura.expires_at is null or ura.expires_at > now())
      and (ura.branch_id is null or ura.branch_id = _branch_id)
  );
$$;

revoke all on schema app from public, anon;
grant usage on schema app to authenticated, service_role;
grant execute on function app.current_roles() to authenticated, service_role;
grant execute on function app.is_super_admin() to authenticated, service_role;
grant execute on function app.has_cross_branch() to authenticated, service_role;
grant execute on function app.has_permission(text, uuid) to authenticated, service_role;
grant execute on function app.has_permission_any_branch(text) to authenticated, service_role;
grant execute on function app.can_access_branch(uuid) to authenticated, service_role;

-- 2. Row-level security ----------------------------------------------------------------

-- Branches: public read of active branches for booking/footer; staff read in scope.
alter table public.branches enable row level security;
revoke all on table public.branches from anon, authenticated;
grant select on table public.branches to anon, authenticated;

drop policy if exists "Active branches are public" on public.branches;
create policy "Active branches are public"
  on public.branches for select to anon, authenticated
  using (is_active);

drop policy if exists "Staff read branches in scope" on public.branches;
create policy "Staff read branches in scope"
  on public.branches for select to authenticated
  using (
    app.has_permission('branches.read', id)
    or app.has_permission('branches.manage', null)
  );

-- Role and permission catalogues are readable but never client-writable.
alter table public.roles enable row level security;
revoke all on table public.roles from anon, authenticated;
grant select on table public.roles to authenticated;
drop policy if exists "Role catalogue is readable" on public.roles;
create policy "Role catalogue is readable"
  on public.roles for select to authenticated using (true);

alter table public.permissions enable row level security;
revoke all on table public.permissions from anon, authenticated;
grant select on table public.permissions to authenticated;
drop policy if exists "Permission catalogue is readable" on public.permissions;
create policy "Permission catalogue is readable"
  on public.permissions for select to authenticated using (true);

alter table public.role_permissions enable row level security;
revoke all on table public.role_permissions from anon, authenticated;
grant select on table public.role_permissions to authenticated;
drop policy if exists "Role permission mapping is readable" on public.role_permissions;
create policy "Role permission mapping is readable"
  on public.role_permissions for select to authenticated using (true);

-- Security policy tables are Super Admin only.
alter table public.role_assignment_rules enable row level security;
revoke all on table public.role_assignment_rules from anon, authenticated;
grant select on table public.role_assignment_rules to authenticated;
drop policy if exists "Super admins read grant rules" on public.role_assignment_rules;
create policy "Super admins read grant rules"
  on public.role_assignment_rules for select to authenticated
  using (app.has_permission('permissions.manage', null));

alter table public.role_conflict_rules enable row level security;
revoke all on table public.role_conflict_rules from anon, authenticated;
grant select on table public.role_conflict_rules to authenticated;
drop policy if exists "Super admins read conflict rules" on public.role_conflict_rules;
create policy "Super admins read conflict rules"
  on public.role_conflict_rules for select to authenticated
  using (app.has_permission('permissions.manage', null));

-- Profiles: own read stays at AAL1 so the phone number needed for first enrolment can
-- load. Profile updates and staff-wide reads require AAL2. Profiles are not branch-bound
-- yet (customers order across branches), so staff reads are global by design for now.
drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id and auth.jwt() ->> 'aal' = 'aal2')
  with check (auth.uid() = id and auth.jwt() ->> 'aal' = 'aal2');

drop policy if exists "Admins read all profiles" on public.profiles;
drop policy if exists "Staff read profiles" on public.profiles;
create policy "Staff read profiles"
  on public.profiles for select to authenticated
  using (
    auth.uid() = id
    or (
      auth.jwt() ->> 'aal' = 'aal2'
      and app.has_permission_any_branch('staff.read')
    )
  );

-- Assignments: own always (AAL1 bootstrap); staff-wide reads need AAL2 and scope.
alter table public.user_role_assignments enable row level security;
revoke all on table public.user_role_assignments from anon, authenticated;
grant select on table public.user_role_assignments to authenticated;

drop policy if exists "Users read their own role assignments" on public.user_role_assignments;
create policy "Users read their own role assignments"
  on public.user_role_assignments for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Staff read role assignments in scope" on public.user_role_assignments;
create policy "Staff read role assignments in scope"
  on public.user_role_assignments for select to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('staff.read', branch_id)
  );

-- Staff employment records.
alter table public.staff_profiles enable row level security;
revoke all on table public.staff_profiles from anon, authenticated;
grant select, insert, update, delete on table public.staff_profiles to authenticated;

drop policy if exists "Staff read own employment record" on public.staff_profiles;
create policy "Staff read own employment record"
  on public.staff_profiles for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Staff read employment records in scope" on public.staff_profiles;
create policy "Staff read employment records in scope"
  on public.staff_profiles for select to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('staff.read', home_branch_id)
  );

drop policy if exists "Staff manage employment records in scope" on public.staff_profiles;
create policy "Staff manage employment records in scope"
  on public.staff_profiles for all to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('staff.manage', home_branch_id)
  )
  with check (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('staff.manage', home_branch_id)
  );

-- Approval limits: finance can read their own limits; Super Admin configures them.
alter table public.approval_limits enable row level security;
revoke all on table public.approval_limits from anon, authenticated;
grant select, insert, update, delete on table public.approval_limits to authenticated;

drop policy if exists "Finance reads approval limits" on public.approval_limits;
create policy "Finance reads approval limits"
  on public.approval_limits for select to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and (
      app.has_permission_any_branch('refunds.approve')
      or app.has_permission('permissions.manage', null)
    )
  );

drop policy if exists "Super admins manage approval limits" on public.approval_limits;
create policy "Super admins manage approval limits"
  on public.approval_limits for all to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('permissions.manage', null)
  )
  with check (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('permissions.manage', null)
  );

-- Sensitive-role requests: requesters insert, Super Admin decides.
alter table public.role_assignment_requests enable row level security;
revoke all on table public.role_assignment_requests from anon, authenticated;
grant select, insert, update on table public.role_assignment_requests to authenticated;

drop policy if exists "Users read their own assignment requests" on public.role_assignment_requests;
create policy "Users read their own assignment requests"
  on public.role_assignment_requests for select to authenticated
  using (target_user_id = auth.uid());

drop policy if exists "Approvers read assignment requests in scope" on public.role_assignment_requests;
create policy "Approvers read assignment requests in scope"
  on public.role_assignment_requests for select to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('roles.assign', branch_id)
  );

drop policy if exists "Requesters create assignment requests" on public.role_assignment_requests;
create policy "Requesters create assignment requests"
  on public.role_assignment_requests for insert to authenticated
  with check (
    auth.jwt() ->> 'aal' = 'aal2'
    and requested_by = auth.uid()
    and target_user_id <> auth.uid()
    and app.has_permission('roles.assign', branch_id)
  );

drop policy if exists "Super admins decide assignment requests" on public.role_assignment_requests;
create policy "Super admins decide assignment requests"
  on public.role_assignment_requests for update to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('permissions.manage', null)
  )
  with check (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('permissions.manage', null)
  );

-- Audit log: Super Admin read only; inserts happen through definer triggers.
alter table public.audit_logs enable row level security;
revoke all on table public.audit_logs from anon, authenticated;
grant select on table public.audit_logs to authenticated;

drop policy if exists "Super admins read audit logs" on public.audit_logs;
create policy "Super admins read audit logs"
  on public.audit_logs for select to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and app.has_permission('audit_logs.read', null)
  );

-- 3. Audit triggers --------------------------------------------------------------------
create or replace function app.audit_user_role_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_action text;
  v_before jsonb;
  v_after jsonb;
  v_id uuid;
  v_branch uuid;
begin
  if tg_op = 'INSERT' then
    v_action := 'role_assignment.created';
    v_before := null;
    v_after := to_jsonb(new);
    v_id := new.id;
    v_branch := new.branch_id;
  elsif tg_op = 'UPDATE' then
    v_action := case
      when new.revoked_at is not null and old.revoked_at is null then 'role_assignment.revoked'
      else 'role_assignment.updated'
    end;
    v_before := to_jsonb(old);
    v_after := to_jsonb(new);
    v_id := new.id;
    v_branch := new.branch_id;
  else
    v_action := 'role_assignment.deleted';
    v_before := to_jsonb(old);
    v_after := null;
    v_id := old.id;
    v_branch := old.branch_id;
  end if;

  insert into public.audit_logs (
    actor_user_id, actor_roles, action, resource_type, resource_id,
    branch_id, before_state, after_state, outcome
  )
  values (
    auth.uid(), app.current_roles(), v_action, 'user_role_assignment', v_id::text,
    v_branch, v_before, v_after, 'success'
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists audit_user_role_assignments on public.user_role_assignments;
create trigger audit_user_role_assignments
  after insert or update or delete on public.user_role_assignments
  for each row execute function app.audit_user_role_assignment();

create or replace function app.audit_branch()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_action text;
begin
  if tg_op = 'INSERT' then
    v_action := 'branch.created';
  elsif tg_op = 'UPDATE' then
    v_action := 'branch.updated';
  else
    v_action := 'branch.deleted';
  end if;

  insert into public.audit_logs (
    actor_user_id, actor_roles, action, resource_type, resource_id,
    branch_id, before_state, after_state, outcome
  )
  values (
    auth.uid(), app.current_roles(), v_action, 'branch',
    case when tg_op = 'DELETE' then old.id else new.id end::text,
    case when tg_op = 'DELETE' then null else new.id end,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end,
    'success'
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists audit_branches on public.branches;
create trigger audit_branches
  after insert or update or delete on public.branches
  for each row execute function app.audit_branch();

create or replace function app.audit_role_permission()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.audit_logs (
    actor_user_id, actor_roles, action, resource_type, resource_id,
    before_state, after_state, outcome
  )
  values (
    auth.uid(), app.current_roles(),
    case when tg_op = 'INSERT' then 'permission_mapping.granted' else 'permission_mapping.revoked' end,
    'role_permission',
    (case when tg_op = 'DELETE' then old.role_id else new.role_id end)::text
      || ':' ||
      (case when tg_op = 'DELETE' then old.permission_id else new.permission_id end)::text,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end,
    'success'
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists audit_role_permissions on public.role_permissions;
create trigger audit_role_permissions
  after insert or update or delete on public.role_permissions
  for each row execute function app.audit_role_permission();

-- Audit rows are append-only, even for a service-role writer.
create or replace function app.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception 'audit_logs is append-only' using errcode = '42501';
end;
$$;

drop trigger if exists audit_logs_append_only on public.audit_logs;
create trigger audit_logs_append_only
  before update or delete on public.audit_logs
  for each row execute function app.prevent_audit_mutation();

revoke all on function app.audit_user_role_assignment() from public, anon, authenticated;
revoke all on function app.audit_branch() from public, anon, authenticated;
revoke all on function app.audit_role_permission() from public, anon, authenticated;
revoke all on function app.prevent_audit_mutation() from public, anon, authenticated;

-- 4. Role assignment guard -------------------------------------------------------------
-- Defence in depth for direct table writes. Server functions must repeat these checks.
-- A NULL auth.uid() means a migration or a service-role server function; those paths
-- bypass this trigger and are responsible for their own authorization.
create or replace function app.guard_user_role_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_role public.roles%rowtype;
  v_super_admin_role uuid;
  v_actor_rank integer;
  v_allowed boolean;
  v_needs_approval boolean := false;
  v_conflict record;
begin
  if v_actor is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'Role assignments are revoked, not deleted';
  end if;

  select id into v_super_admin_role from public.roles where code = 'super_admin';

  if tg_op = 'UPDATE' then
    if new.user_id <> old.user_id
       or new.role_id <> old.role_id
       or new.branch_id is distinct from old.branch_id then
      raise exception 'Revoke the assignment and create a new one instead of changing user, role or branch';
    end if;

    if old.revoked_at is not null and new.revoked_at is null then
      raise exception 'A revoked assignment cannot be reactivated; create a new assignment';
    end if;

    if new.revoked_at is not null
       and old.revoked_at is null
       and old.role_id = v_super_admin_role
       and not exists (
         select 1
         from public.user_role_assignments ura
         where ura.role_id = v_super_admin_role
           and ura.id <> old.id
           and ura.revoked_at is null
           and (ura.expires_at is null or ura.expires_at > now())
       ) then
      raise exception 'The last active Super Admin cannot be revoked';
    end if;

    return new;
  end if;

  select * into v_role from public.roles where id = new.role_id;
  if v_role.id is null then
    raise exception 'Unknown role';
  end if;

  if new.user_id = v_actor then
    raise exception 'Users cannot assign roles to themselves';
  end if;

  -- branch_id NULL means global. Only a Super Admin may create a global grant.
  if new.branch_id is null and not app.is_super_admin() then
    raise exception 'Only a Super Admin can create a global role assignment';
  end if;

  select max(r.rank) into v_actor_rank
  from public.user_role_assignments ura
  join public.roles r on r.id = ura.role_id
  where ura.user_id = v_actor
    and ura.revoked_at is null
    and (ura.expires_at is null or ura.expires_at > now());

  if v_role.code = 'super_admin' then
    if not app.is_super_admin() then
      raise exception 'Only a Super Admin can grant the Super Admin role';
    end if;
  elsif coalesce(v_actor_rank, 0) <= v_role.rank then
    raise exception 'Cannot assign a role at or above your own rank';
  end if;

  -- The grant ceiling decides both assignability and whether approval is needed.
  select
    count(*) > 0,
    coalesce(bool_or(rar.requires_approval), false)
  into v_allowed, v_needs_approval
  from public.role_assignment_rules rar
  join public.user_role_assignments ura on ura.role_id = rar.actor_role_id
  where ura.user_id = v_actor
    and ura.revoked_at is null
    and (ura.expires_at is null or ura.expires_at > now())
    and rar.target_role_id = new.role_id
    and (new.branch_id is null or ura.branch_id is null or ura.branch_id = new.branch_id);

  if not v_allowed then
    raise exception 'This role is not assignable by the current user';
  end if;

  for v_conflict in
    select cr.severity, cr.requires_super_admin, other.code as other_code
    from public.role_conflict_rules cr
    join public.roles other
      on other.id = case
        when cr.role_a_id = new.role_id then cr.role_b_id
        else cr.role_a_id
      end
    join public.user_role_assignments held
      on held.role_id = other.id
     and held.user_id = new.user_id
     and held.revoked_at is null
     and (held.expires_at is null or held.expires_at > now())
    where cr.role_a_id = new.role_id or cr.role_b_id = new.role_id
  loop
    if v_conflict.severity = 'block' then
      raise exception 'Role % conflicts with % and is blocked', v_role.code, v_conflict.other_code;
    end if;
    if v_conflict.requires_super_admin then
      v_needs_approval := true;
    end if;
  end loop;

  if v_needs_approval then
    if new.approval_id is null or not exists (
      select 1
      from public.role_assignment_requests req
      where req.id = new.approval_id
        and req.status = 'approved'
        and req.target_user_id = new.user_id
        and req.role_id = new.role_id
        and req.branch_id is not distinct from new.branch_id
    ) then
      raise exception 'This role or combination requires an approved assignment request';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_user_role_assignments on public.user_role_assignments;
create trigger guard_user_role_assignments
  before insert or update or delete on public.user_role_assignments
  for each row execute function app.guard_user_role_assignment();

revoke all on function app.guard_user_role_assignment() from public, anon, authenticated;

-- 5. Legacy compatibility and cutover --------------------------------------------------
-- Keep public.has_role working for the existing profile policies, but back it with the
-- new assignment tables. The enum stays for compatibility with 20261028130000.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_role_assignments ura
    join public.roles r on r.id = ura.role_id
    where ura.user_id = _user_id
      and ura.revoked_at is null
      and (ura.expires_at is null or ura.expires_at > now())
      and r.code = _role::text
  );
$$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- New accounts get a profile and the CUSTOMER baseline in the new model.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_role uuid;
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do nothing;

  select id into v_customer_role from public.roles where code = 'customer';
  if v_customer_role is not null then
    insert into public.user_role_assignments (user_id, role_id, reason)
    values (new.id, v_customer_role, 'signup')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;

-- Move any legacy single-role rows into the new model before removing the old table.
do $$
begin
  if to_regclass('public.user_roles') is not null then
    execute $mig$
      insert into public.user_role_assignments (user_id, role_id, branch_id, reason)
      select ur.user_id, r.id, null, 'Migrated from legacy user_roles'
      from public.user_roles ur
      join public.roles r on r.code = ur.role::text
      on conflict do nothing
    $mig$;
  end if;
end;
$$;

drop table if exists public.user_roles cascade;
