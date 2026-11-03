-- KBestoreTZ: real product catalogue, with prices and photos managed by staff.
--
-- NOT applied automatically. Requires 20261028120000_auth_roles_profiles.sql first (uses has_role).
-- Run once in the Supabase SQL editor as the project owner. See docs/CATALOGUE_SETUP.md.
--
-- Who can do what (decision for the owner to confirm):
--   * Everyone (including signed-out visitors) can READ published products and their photos.
--   * Admin AND technician can add products, change price / stock / description and upload photos.
--   * Technicians may also publish / un-publish; only admins may delete a product or photo.
--   * Customers can change nothing.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null,
  category text not null,
  -- Prices are whole Tanzanian shillings. NULL price on a spare part means "price on request".
  price_tzs bigint check (price_tzs is null or price_tzs >= 0),
  compare_at_tzs bigint check (compare_at_tzs is null or compare_at_tzs >= 0),
  stock integer not null default 0 check (stock >= 0),
  warranty text,
  tagline text,
  specs jsonb not null default '[]'::jsonb,
  -- Spare parts: which devices the part fits, and its quality grade.
  compatible_models text[] not null default '{}',
  quality_grade text check (quality_grade in ('original', 'oem', 'aftermarket')),
  image_paths text[] not null default '{}',
  published boolean not null default false,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create or replace function public.touch_product()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger products_touch
  before update on public.products
  for each row execute function public.touch_product();

create policy "Anyone reads published products"
  on public.products for select to anon, authenticated
  using (published);

create policy "Staff read all products"
  on public.products for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'technician'));

create policy "Staff add products"
  on public.products for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'technician'));

create policy "Staff edit products"
  on public.products for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'technician'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'technician'));

create policy "Admins delete products"
  on public.products for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Photos: a public bucket (customers must see them), writable only by staff.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Anyone views product photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Staff upload product photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'technician'))
  );

create policy "Staff replace product photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'technician'))
  );

create policy "Admins delete product photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
