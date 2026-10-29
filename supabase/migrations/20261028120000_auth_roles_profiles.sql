-- KBestoreTZ: user profiles and roles for registration, login and access control.
--
-- NOT applied automatically. Review it, then run it once in the Supabase SQL editor
-- (or with the Supabase CLI) as the project owner. See docs/AUTH_SETUP.md.
--
-- Design rules:
--   * Roles live in their own table, never on the profile, so a user can never
--     promote themselves by editing their own profile.
--   * Everyone who signs up becomes a 'customer'. 'admin' and 'technician' are granted
--     only by an existing admin (or by the owner running SQL), never from the website.
--   * Row-level security is on for every table; no policy lets a user write a role.

-- 1. Roles ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'technician', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 2. Profiles ------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 3. Role check used by the policies below ---------------------------------------------
-- SECURITY DEFINER so the policies can read user_roles without recursing into themselves.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- 4. Policies --------------------------------------------------------------------------
create policy "Users read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create policy "Admins manage all roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users read their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 5. New sign-ups get a profile and the customer role ------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  );

  insert into public.user_roles (user_id, role) values (new.id, 'customer');

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Making someone staff (run by the owner, after that person has signed up) -----------
-- Replace the email, then run ONE of these in the SQL editor:
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'owner@example.com'
--   on conflict do nothing;
--
--   insert into public.user_roles (user_id, role)
--   select id, 'technician' from auth.users where email = 'technician@example.com'
--   on conflict do nothing;
