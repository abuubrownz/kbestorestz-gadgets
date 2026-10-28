# Switching on real accounts (sign-up, login, email and phone verification)

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

After confirming the existing database schema matches the first migration, apply
`supabase/migrations/20261028130000_require_aal2_for_roles.sql`. It requires a verified phone
second factor before application roles can be read or changed. Do not apply it blindly to a
project whose existing policies have not been checked.

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

## 3. Configure SMS phone verification

The app requires a phone MFA code after every password sign-in. On a user's first sign-in, it
enrols the Tanzanian mobile number supplied during registration and asks the user to verify it.
Later sign-ins send a fresh code to that verified number. Supabase creates and verifies the OTP;
the application does not store or handle the plaintext OTP.

SMS delivery uses Supabase Auth's signed **Send SMS Hook** and an Edge Function adapter for
Africa's Talking. This repository does not contain provider credentials, an approved sender ID,
or proof that live SMS delivery is enabled.

1. In Africa's Talking, create/confirm the SMS account and obtain the API key and username.
   Confirm Tanzania coverage, production status, account balance/pricing, and sender-ID approval
   with the provider. Keep all secrets out of Git and chat.
2. In Supabase **Authentication → Multi-Factor Authentication**, enable phone factors for the
   project. Keep email/password as the first factor.
3. Deploy `supabase/functions/send-sms-hook` to the intended Supabase project using an
   authenticated Supabase CLI environment. The function has JWT verification disabled because
   it validates Supabase Auth's signed webhook request itself.
4. Configure these **Edge Function secrets** using the Supabase Dashboard's function secrets
   interface or an approved secret manager:
   - `SEND_SMS_HOOK_SECRET`: the signing secret created for the Supabase Send SMS Hook.
   - `AFRICASTALKING_API_KEY`
   - `AFRICASTALKING_USERNAME` (`sandbox` for provider sandbox, or the approved production name).
   - `AFRICASTALKING_SENDER_ID` only if a sender ID has been approved; otherwise omit it.
5. In Supabase **Authentication → Hooks**, configure the **Send SMS Hook** to call this Edge
   Function with its matching signing secret. Configure provider and Auth rate limits before
   enabling for customers.
6. Test first with a provider-approved test number/account. Confirm delivery and failure behavior
   before production use. Provider credentials and live SMS delivery are not configured by this
   repository change.

If the phone MFA factor cannot be enrolled or the signed hook/provider fails, sign-in fails closed:
the account does not reach its customer, technician, or admin area.
There is no self-service phone replacement or recovery flow in this milestone. Define and test an
account-recovery procedure before production so customers who lose access to their verified phone
are not permanently locked out.

## 4. Make yourself the first administrator

1. Go to the website, open **Sign in**, then **Create account**, and register with your own email.
2. Click the link in the confirmation email.
3. In Supabase **SQL Editor** run this, changing the email to yours:

   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'your-email@example.com'
   on conflict do nothing;
   ```

4. Sign out and sign in again. You will now see the Admin dashboard link.

## 5. Adding technicians

Ask the technician to register on the website and confirm their email. Then run the same query
with `'technician'` and their email. Nobody can give themselves staff access from the website.

## What this does and does not protect

- Registering always creates a **customer**. Roles are stored in their own table that customers
  cannot change.
- The admin and technician pages hide themselves from other roles, but the **real protection of
  data is the database security rules**. Role policies require Supabase AAL2 (verified phone MFA).
  Every future business table must also have its own least-privilege RLS policies.
- Dashboard business data is still sample data; phone MFA does not make sample business records
  persistent or turn them into customer-specific records.
- Customers' names, phone numbers and emails are personal data. Before launch, confirm your
  privacy notice and data handling with a Tanzanian lawyer (Personal Data Protection Act, 2022).

## Testing checklist

- Register a new account: you should see "Check your email" and **cannot** sign in until you click
  the link.
- After confirming, sign in: you land on **My account**, and `/admin` shows "You don't have access".
- At first sign-in, verify the SMS code to enroll the phone. Sign out and sign in again to confirm
  another code is required before the account loads.
- With only an AAL1 session, direct reads/writes of `user_roles` must be denied by RLS.
- "Forgot your password?" sends a link that opens **Choose a new password**.
- A wrong password shows one neutral message.
