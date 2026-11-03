# Switching on real accounts (sign-up, login, email and phone verification)

The website code is ready, but the **database must be prepared once** before staff roles and
profiles work. Sign-in itself works as soon as the Supabase project accepts email/password users;
until the first migration is applied, every account is treated as a **customer** and the profile
name falls back to the name supplied at registration.

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

**Order matters:** finish section 3 (working phone MFA) before applying the AAL2 migration. That
migration deliberately hides `user_roles` from AAL1 sessions, so on a project where phone MFA is
not yet working, administrators would be treated as customers and would not see the admin console.


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

The app asks for a phone MFA code after every password sign-in **once the account has a verified
phone factor**. On a user's first sign-in it enrols the Tanzanian mobile number supplied during
registration and asks the user to verify it. Later sign-ins send a fresh code to that verified
number. Supabase creates and verifies the OTP; the application does not store or handle the
plaintext OTP.

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

If a **verified** phone factor exists but the challenge cannot start, sign-in fails closed: the
account does not reach its customer, technician, or admin area. That is deliberate, so a working
second factor cannot be bypassed by breaking the challenge.

If the account has **no verified phone factor yet** and enrolment cannot start — the project's
phone provider is off, the SMS hook is missing or the number is absent — the app logs a warning and
signs the user in with email and password only (AAL1). This prevents a total lockout while the
Supabase project is still being configured, and it is reported in the browser console. As soon as
phone verification is configured, the next sign-in enrols the number and later sign-ins require the
code. Do not treat the fallback as the production security model.

There is no self-service phone replacement or recovery flow in this milestone. Define and test an
account-recovery procedure before production so customers who lose access to their verified phone
are not permanently locked out.

### When the sign-up SMS is actually sent

The sign-up form collects the phone number and stores it on the account, but **Supabase cannot send
a phone OTP for an email + password sign-up before the email is confirmed.** The confirmation link
creates the first session, and that is what allows the app to enrol the phone factor and request the
code. So the real sequence is:

1. Customer registers with name, phone, email and password.
2. Supabase emails a confirmation link.
3. The customer opens the link. The app receives a signed-in session, enrols the phone number from
   step 1, and the SMS hook sends the six-digit code.
4. The customer enters the code and only then reaches the account.

If the email link is never opened, no SMS is sent. If the project ever switches **Confirm email**
off, the code is sent immediately after registration instead — do not make that change without CTO
approval, because it weakens the account-recovery guarantee.

**Forgot password** is email-only in Supabase. The sign-in and registration panels now open a
dedicated reset view that sends a one-time email link to `/reset-password`; it never claims to send
an SMS reset. Customers without access to the registered email are pointed at support for manual
verification.

### Free ways to test the OTP before paying for SMS

- **Supabase test phone numbers** (Authentication → Phone provider → test numbers): add a number and
  a fixed code. Supabase accepts that code without calling the SMS hook, so end-to-end testing costs
  nothing. Never use these numbers for real customers.
- **Africa's Talking sandbox**: free sandbox messages to numbers you have verified in the sandbox;
  useful for checking the hook adapter itself.
- Production SMS is not free. Budget for one message per new account and one per sign-in.

### Choosing a bulk SMS provider for Tanzania

Prices below are published list prices found on the providers' public coverage pages; confirm the
current quote and sender-ID approval before budgeting.

| Provider | Tanzania outbound SMS | Notes |
| --- | --- | --- |
| **Beem Africa** | **TZS 20** (1–10,000), TZS 18 (10k–25k), TZS 17 (25k–50k), TZS 16 (50k–100k), TZS 14 (100k–250k), TZS 13 (250k–500k), TZS 12 (500k–1M) | Tanzania-based; sender ID registration required. Cheapest published local rate found. |
| **Africa's Talking** | Confirm current Tanzania quote | Already wired into `send-sms-hook`; free sandbox for testing. Keep as the low-effort path. |
| **Twilio** | **USD 0.4336** per segment (Oct 2026) | About 50–60× the Beem rate; only sensible if global coverage matters more than cost. |

**Recommendation:** use **Beem Africa for production volume** and keep the existing Africa's Talking
adapter as the fallback/testing route. Switching providers is a small change to
`supabase/functions/send-sms-hook/index.ts` (add a `SMS_PROVIDER` branch, keep the same signed-webhook
validation and `+255[67]` guard), followed by new Edge Function secrets and a sender-ID approval.
That is an infrastructure change: get CTO approval, then test with one number before enabling it for
customers. For a zero-cost pilot, use Supabase test phone numbers and the Africa's Talking sandbox.
WhatsApp authentication templates are a possible cheaper fallback later (Beem lists about
USD 0.01 per authentication message for the rest of Africa), but they need a WhatsApp Business
account and approved templates.

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

- Register a new account: you should see "Check your email" with a three-step notice that shows
  the phone number masked, and **cannot** reach the account until you click the link.
- Open the confirmation link. With phone verification configured, you land on **Verify your phone
  number** and the SMS hook requests a code for the number entered at sign-up. If it does not
  arrive, **Send a new code** is disabled for 45 seconds and then works. With no phone provider or
  SMS route configured, you are signed in with email and password only.
- After the code (or the password-only fallback) you land on **My account**; `/admin` shows "You
  don't have access" for a customer.
- Sign out and sign in again: when a verified phone factor exists, another SMS code is required
  before the account loads.
- **Forgot your password?** opens the reset view from both the sign-in and registration panels. A
  valid email sends a link that opens **Choose a new password**; the same neutral confirmation shows
  for an address with no account.
- A wrong password shows one neutral message.
- With only an AAL1 session, direct reads/writes of `user_roles` must be denied by RLS.
