# Switching on real accounts (sign-up, login, email verification)

The website code is ready, but the **database must be prepared once** before anyone can register.
Until you do this, sign-up and login will show an error. Nothing here needs code, and no
password or key should ever be pasted into chat, GitHub or the website code.

## 1. Create the tables (once)

1. Open your Supabase project, then **SQL Editor**, then **New query**.
2. Open `supabase/migrations/20261028120000_auth_roles_profiles.sql` from this repo, copy all of
   it, paste it into the editor and press **Run**.
3. It should finish with "Success". If it says something already exists, stop and do not re-run
   it: ask your engineer to check what is already in the project first.

This creates: `profiles` (name and phone), `user_roles` (who is admin / technician / customer),
a role-check function, security rules, and an automatic step that makes every new sign-up a
**customer**.

## 2. Turn on email confirmation

Supabase dashboard, **Authentication**:

- **Sign In / Providers**, then **Email**: keep **Confirm email** switched **on**. Set the minimum
  password length to **8**.
- **URL Configuration**:
  - **Site URL**: your live address (for example `https://kbestorestz.lovable.app`, or your own
    domain once connected).
  - **Redirect URLs**: add `https://<your live address>/login` and
    `https://<your live address>/reset-password`. While testing, you may also add your preview
    address.
- **SMTP Settings**: Supabase's built-in email is for testing only and is heavily limited. Before
  real customers register, set up a real sender (a service such as Resend, Brevo or Zoho) so
  confirmation emails arrive reliably and do not land in spam.

## 3. Make yourself the first administrator

1. Go to the website, open **Sign in**, then **Create account**, and register with your own email.
2. Click the link in the confirmation email.
3. In Supabase **SQL Editor** run this, changing the email to yours:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'your-email@example.com'
   on conflict do nothing;
   ```

4. Sign out and sign in again. You will now see the Admin dashboard link.

## 4. Adding technicians

Ask the technician to register on the website and confirm their email. Then run the same query
with `'technician'` and their email. Nobody can give themselves staff access from the website.

## What this does and does not protect

- Registering always creates a **customer**. Roles are stored in their own table that customers
  cannot change.
- The admin and technician pages hide themselves from other roles, but the **real protection of
  data is the database security rules**. The admin screens still show sample data bundled with the
  site. When real orders, repairs and customers move into the database, each table must be created
  with its own security rules.
- Customers' names, phone numbers and emails are personal data. Before launch, confirm your
  privacy notice and data handling with a Tanzanian lawyer (Personal Data Protection Act, 2022).

## Testing checklist

- Register a new account: you should see "Check your email" and **cannot** sign in until you click
  the link.
- After confirming, sign in: you land on **My account**, and `/admin` shows "You don't have access".
- "Forgot your password?" sends a link that opens **Choose a new password**.
- A wrong password shows one neutral message.
