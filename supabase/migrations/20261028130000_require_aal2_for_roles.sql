-- Require a verified second factor before reading or administering application roles.
-- Profile reads stay available at AAL1 so existing users can load the phone number
-- needed to enroll their first phone factor.

drop policy if exists "Users read their own roles" on public.user_roles;
create policy "Users read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id and auth.jwt() ->> 'aal' = 'aal2');

drop policy if exists "Admins manage all roles" on public.user_roles;
create policy "Admins manage all roles"
  on public.user_roles for all to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and public.has_role(auth.uid(), 'admin')
  )
  with check (
    auth.jwt() ->> 'aal' = 'aal2'
    and public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id and auth.jwt() ->> 'aal' = 'aal2')
  with check (auth.uid() = id and auth.jwt() ->> 'aal' = 'aal2');

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (
    auth.jwt() ->> 'aal' = 'aal2'
    and public.has_role(auth.uid(), 'admin')
  );
