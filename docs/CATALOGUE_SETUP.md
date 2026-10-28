# Real product catalogue: prices and photos managed by staff

**Status: database part only.** This adds the tables and security rules. The admin and technician
screens (`/admin/products`) still edit in-memory sample data: changes vanish on refresh. Wiring
those screens and the storefront to this table is the next step (separate pull request).

## Run once
1. Finish `docs/AUTH_SETUP.md` first (this uses its roles).
2. Supabase, **SQL Editor**: paste and run `supabase/migrations/20261028150000_catalogue_products_images.sql`.

## Who can do what (please confirm)
| Action | Visitor / customer | Technician | Admin |
|---|---|---|---|
| See published products and photos | yes | yes (also unpublished) | yes |
| Add product, set price / stock / description | no | yes | yes |
| Upload or replace photos (JPG/PNG/WebP, max 5 MB) | no | yes | yes |
| Publish / un-publish | no | yes | yes |
| Delete a product or photo | no | no | yes |

If you prefer technicians **not** to change prices, say so and the policy will be narrowed
(for example: technicians edit stock and photos only).

## Spare parts
Each part can record the devices it fits (`compatible_models`) and a quality grade (original, OEM,
aftermarket). Leave the price empty to show "Price on request".

## Not included yet
Price-change history, and a review step before a technician's change goes live.
