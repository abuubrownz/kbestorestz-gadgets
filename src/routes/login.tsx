import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  BellRing,
  CircleCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  MailCheck,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { PublicShell } from "@/components/kb/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import brandLogo from "@/assets/brand/kbestoretz-logo.png";
import { roleHome, useAuth, type AuthErrorCode } from "@/lib/auth";
import { CONTACT_WHATSAPP } from "@/lib/contact";

/** Only allow same-site relative paths as a post-login destination. */
function safeRedirect(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : undefined;
}

export const Route = createFileRoute("/login")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = safeRedirect(search["redirect"]);
    return redirect ? { redirect } : {};
  },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Sign in or create an account | KBestoreTZ" },
      {
        name: "description",
        content: "Sign in to your KBestoreTZ account, or create one to track orders and repairs.",
      },
      { property: "og:title", content: "Sign in or create an account | KBestoreTZ" },
      {
        property: "og:description",
        content: "Sign in to your KBestoreTZ account, or create one to track orders and repairs.",
      },
    ],
  }),
  component: LoginPage,
});

/** Accepts 0713…, 713…, +255713… and returns +255713134116, or null if it is not a Tanzanian mobile. */
function normalizePhone(value: string): string | null {
  const digits = value.replace(/[\s\-()]/g, "");
  const match = /^(?:\+?255|0)?([67]\d{8})$/.exec(digits);
  return match ? `+255${match[1]}` : null;
}

/** +255713134116 → +255 713 ••• 116, so the page never reprints the full number. */
function maskPhone(value: string): string {
  const phone = normalizePhone(value);
  if (!phone) return value;
  return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ••• ${phone.slice(-3)}`;
}

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);
const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(72),
});

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100),
    phone: z.string().refine((v) => normalizePhone(v) !== null, {
      message: "Enter a Tanzanian mobile number, e.g. 0713 134 116.",
    }),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match.",
  });

type FieldErrors = Record<string, string | undefined>;

function collectErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

function messageFor(code: AuthErrorCode): string {
  switch (code) {
    case "invalid_credentials":
      return "Email or password is incorrect.";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox for the link we sent.";
    case "weak_password":
      return "That password is too weak. Use at least 8 characters with letters and numbers.";
    case "rate_limited":
      return "Too many attempts or emails sent. Please wait a few minutes and try again.";
    case "invalid_otp":
      return "That code is incorrect or expired. Check your SMS and try again.";
    case "network":
      return "We could not reach the server. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function FieldError({ message }: { message?: string | undefined }) {
  return message ? (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  ) : null;
}

const authPanels = {
  signin: {
    eyebrow: "Welcome back",
    title: "Pick up where you left off",
    intro: "Your orders, repairs and warranty records are waiting in your dashboard.",
    points: [
      {
        Icon: PackageCheck,
        tone: "text-cat-home",
        text: "See every order, receipt and warranty in one place.",
      },
      {
        Icon: Wrench,
        tone: "text-cat-phone",
        text: "Follow active repairs stage by stage instead of calling the shop.",
      },
      {
        Icon: BellRing,
        tone: "text-cat-audio",
        text: "Get an email and SMS alert when your device is ready for collection.",
      },
      {
        Icon: ShieldCheck,
        tone: "text-cat-parts",
        text: "Password plus phone-code verification keeps the account yours.",
      },
    ],
    footnote: "Only tracking a repair? Use your ticket number — no account needed.",
  },
  register: {
    eyebrow: "New to KBestoreTZ",
    title: "One account for shopping, repairs and warranty",
    intro:
      "Free to create, no card details. About a minute to set up, then everything stays together.",
    points: [
      {
        Icon: ShieldCheck,
        tone: "text-cat-parts",
        text: "Sign up with email, phone and a password — confirm the email, verify the phone.",
      },
      {
        Icon: PackageCheck,
        tone: "text-cat-home",
        text: "Purchases and warranties are filed automatically as you order.",
      },
      {
        Icon: Wrench,
        tone: "text-cat-phone",
        text: "Repairs booked with your account are tracked from drop-off to collection.",
      },
      {
        Icon: BellRing,
        tone: "text-cat-audio",
        text: "Loyalty points and service updates follow you across every visit.",
      },
    ],
    footnote: "In a hurry? You can still book a repair as a guest and track it with a ticket number.",
  },
  reset: {
    eyebrow: "Account recovery",
    title: "Get back into your account safely",
    intro:
      "We will email you a one-time link. Open it to choose a new password — we never send passwords by SMS or email.",
    points: [
      {
        Icon: KeyRound,
        tone: "text-cat-audio",
        text: "The reset link is single-use and expires, so it cannot be reused later.",
      },
      {
        Icon: MailCheck,
        tone: "text-cat-home",
        text: "Check the inbox for the email you registered with — including spam or promotions.",
      },
      {
        Icon: ShieldCheck,
        tone: "text-cat-parts",
        text: "Your phone code is still required the next time you sign in, so keep your SIM active.",
      },
    ],
    footnote: "No access to the email on the account? Message us and we will verify you another way.",
  },
} as const;

function LoginPage() {
  const { user, ready, phoneMfaChallenge, phoneMfaError } = useAuth();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [verify, setVerify] = useState<{ email: string; phone: string } | null>(null);
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const panel = authPanels[forgot ? "reset" : tab];

  // Once a session exists (just signed in, or already signed in), leave this page.
  useEffect(() => {
    if (ready && user) router.history.push(redirect ?? roleHome[user.role]);
  }, [ready, user, redirect, router]);

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center">
        <aside className="ink-panel hidden overflow-hidden rounded-3xl lg:block">
          <div className="rainbow-rule h-1 w-full" aria-hidden />
          <div className="p-8">
            <img
              src={brandLogo}
              alt="KBestoreTZ — tech shopping"
              className="mb-7 w-48"
            />
            <p className="eyebrow text-white/60">{panel.eyebrow}</p>
            <h2 className="mt-2 font-display text-2xl font-bold">{panel.title}</h2>
            <p className="mt-2 text-sm text-white/60">{panel.intro}</p>
            <ul className="mt-6 space-y-5 text-sm text-white/80">
              {panel.points.map(({ Icon, tone, text }) => (
                <li key={text} className="flex gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-t border-white/10 pt-4 text-xs text-white/55">
              {panel.footnote}{" "}
              {forgot ? (
                <a
                  href={`https://wa.me/${CONTACT_WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-white/85 underline-offset-4 hover:underline"
                >
                  Message support
                </a>
              ) : (
                <Link
                  to={tab === "signin" ? "/repairs/track" : "/repairs/book"}
                  className="font-medium text-white/85 underline-offset-4 hover:underline"
                >
                  {tab === "signin" ? "Track a repair" : "Book as a guest"}
                </Link>
              )}
            </p>
          </div>
        </aside>

        <div className="mx-auto grid w-full max-w-md gap-4">
          <div className="text-center lg:text-left">
            <h1 className="font-display text-2xl font-bold">
              {forgot
                ? "Reset your password"
                : tab === "signin"
                  ? "Welcome back"
                  : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {forgot
                ? "Enter the email you registered with and we will send a one-time reset link."
                : tab === "signin"
                  ? "Sign in to see your orders, repairs and warranty records."
                  : "Keep orders, repairs and warranties together. Free, and no card details needed."}
            </p>
          </div>

          <Card className="p-6 shadow-card">
            {verify ? (
              <VerifyNotice
                email={verify.email}
                phone={verify.phone}
                onDone={() => {
                  setVerify(null);
                  setTab("signin");
                }}
              />
            ) : phoneMfaChallenge || phoneMfaError ? (
              <PhoneMfaForm />
            ) : forgot ? (
              <ForgotPasswordForm
                initialEmail={forgotEmail}
                onBack={() => setForgot(false)}
              />
            ) : (
              <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "register")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="register">Create account</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" className="mt-5">
                  <SignInForm
                    onForgot={(email) => {
                      setForgotEmail(email);
                      setForgot(true);
                    }}
                  />
                </TabsContent>
                <TabsContent value="register" className="mt-5">
                  <RegisterForm
                    onRegistered={setVerify}
                    onForgot={(email) => {
                      setForgotEmail(email);
                      setForgot(true);
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </Card>

          <p className="text-center text-xs text-muted-foreground lg:text-left">
            Staff (technicians and administrators) sign in here too. Their accounts are set up by
            KBestoreTZ management. Creating an account here always gives customer access.
          </p>
        </div>
      </div>
    </PublicShell>
  );
}

function PhoneMfaForm() {
  const {
    phoneMfaChallenge,
    phoneMfaError,
    verifyPhoneMfa,
    resendPhoneMfa,
    cancelPhoneMfa,
  } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code from your SMS.");
      return;
    }

    setBusy(true);
    const result = await verifyPhoneMfa(code);
    setBusy(false);
    if (!result.ok) setError(messageFor(result.code));
  }

  async function onResend() {
    if (cooldown > 0) return;
    setBusy(true);
    setError(null);
    const result = await resendPhoneMfa();
    setBusy(false);
    if (result.ok) {
      setCode("");
      setInfo("A new verification code was sent. It can take a minute to arrive.");
      setCooldown(45);
    } else {
      setError(messageFor(result.code));
    }
  }

  return (
    <div className="grid gap-4">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
        <Smartphone className="h-5 w-5" />
      </span>
      <div className="text-center">
        <h2 className="font-display text-lg font-bold">
          {phoneMfaChallenge?.isEnrollment ? "Verify your phone number" : "Enter your sign-in code"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {phoneMfaChallenge ? (
            <>
              We sent a six-digit SMS code to{" "}
              <span className="font-medium text-foreground">{phoneMfaChallenge.phone}</span>.
            </>
          ) : (
            phoneMfaError
          )}
        </p>
        {phoneMfaChallenge?.isEnrollment ? (
          <p className="mt-2 text-xs text-muted-foreground">
            This is the number you entered when you signed up. Verifying it now secures every future
            sign-in.
          </p>
        ) : null}
      </div>

      {phoneMfaChallenge ? (
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="mfa-code">Six-digit code</Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
            />
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          {info ? <p role="status" className="text-sm text-muted-foreground">{info}</p> : null}
          <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify and continue
          </Button>
          <Button type="button" variant="outline" onClick={onResend} disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
          </Button>
          <a
            href={`https://wa.me/${CONTACT_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> No SMS, or wrong number? Message support
          </a>
        </form>
      ) : null}

      {!phoneMfaChallenge && phoneMfaError ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          Phone verification is required to sign in. Please try again later or contact support.
        </p>
      ) : null}
      <Button type="button" variant="ghost" onClick={() => void cancelPhoneMfa()} disabled={busy}>
        Use a different account
      </Button>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SignInForm({ onForgot }: { onForgot: (email: string) => void }) {
  const { signInWithPassword, resendConfirmation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<AuthErrorCode | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setInfo(null);
    setFormError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const result = await signInWithPassword(parsed.data.email, parsed.data.password);
    setBusy(false);
    if (!result.ok) setFormError(result.code);
    // On success the session listener updates the user and the page redirects.
  }

  async function onResend() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return;
    const result = await resendConfirmation(parsed.data);
    setInfo(
      result.ok
        ? "We have sent the confirmation email again."
        : messageFor(result.code),
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="si-email">Email</Label>
        <Input
          id="si-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldError message={errors["email"]} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="si-password">Password</Label>
        <PasswordInput
          id="si-password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        <FieldError message={errors["password"]} />
      </div>

      {formError ? (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {messageFor(formError)}
          {formError === "email_not_confirmed" ? (
            <button type="button" onClick={onResend} className="mt-1 block font-medium underline">
              Send the confirmation email again
            </button>
          ) : null}
        </div>
      ) : null}
      {info ? (
        <p role="status" className="flex items-start gap-2 text-sm text-muted-foreground">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-cat-home" /> {info}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in
      </Button>
      <button
        type="button"
        onClick={() => onForgot(email)}
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Forgot your password?
      </button>
    </form>
  );
}

function RegisterForm({
  onRegistered,
  onForgot,
}: {
  onRegistered: (account: { email: string; phone: string }) => void;
  onForgot: (email: string) => void;
}) {
  const { register } = useAuth();
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<AuthErrorCode | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const phone = normalizePhone(parsed.data.phone) ?? parsed.data.phone;
    const result = await register({
      fullName: parsed.data.fullName,
      phone,
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (result.ok) onRegistered({ email: parsed.data.email, phone });
    else setFormError(result.code);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="rg-name">Full name</Label>
        <Input
          id="rg-name"
          autoComplete="name"
          value={values.fullName}
          onChange={set("fullName")}
        />
        <FieldError message={errors["fullName"]} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rg-phone">Mobile number</Label>
        <Input
          id="rg-phone"
          type="tel"
          autoComplete="tel"
          placeholder="0713 134 116"
          value={values.phone}
          onChange={set("phone")}
        />
        <FieldError message={errors["phone"]} />
        <p className="text-xs text-muted-foreground">
          We text a six-digit code to this number as soon as you confirm your email. Use a number you
          can receive SMS on now.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rg-email">Email</Label>
        <Input
          id="rg-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={set("email")}
        />
        <FieldError message={errors["email"]} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rg-password">Password</Label>
        <PasswordInput
          id="rg-password"
          autoComplete="new-password"
          value={values.password}
          onChange={(v) => setValues((cur) => ({ ...cur, password: v }))}
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        <FieldError message={errors["password"]} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rg-confirm">Confirm password</Label>
        <PasswordInput
          id="rg-confirm"
          autoComplete="new-password"
          value={values.confirm}
          onChange={(v) => setValues((cur) => ({ ...cur, confirm: v }))}
        />
        <FieldError message={errors["confirm"]} />
      </div>

      {formError ? (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {messageFor(formError)}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create account
      </Button>
      <button
        type="button"
        onClick={() => onForgot(values.email)}
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Already registered? Reset your password
      </button>
    </form>
  );
}

function ForgotPasswordForm({
  initialEmail,
  onBack,
}: {
  initialEmail: string;
  onBack: () => void;
}) {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((seconds) => (seconds <= 1 ? 0 : seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function send(): Promise<void> {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setBusy(true);
    const result = await sendPasswordReset(parsed.data);
    setBusy(false);
    if (!result.ok) {
      setError(messageFor(result.code));
      return;
    }
    setSent(true);
    setCooldown(60);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await send();
  }

  if (sent) {
    return (
      <div className="grid gap-4 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cat-home/10 text-cat-home">
          <MailCheck className="h-5 w-5" />
        </span>
        <h2 className="font-display text-lg font-bold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          If <span className="font-medium text-foreground">{email}</span> has an account, we sent a
          one-time link to reset the password. It can take a minute — check spam or promotions too.
        </p>
        <p className="rounded-lg border bg-secondary/40 p-3 text-xs text-muted-foreground">
          The link opens a page where you choose a new password. It expires, so use it soon.
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button variant="outline" onClick={() => void send()} disabled={busy || cooldown > 0}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {cooldown > 0 ? `Send the link again in ${cooldown}s` : "Send the link again"}
        </Button>
        <a
          href={`https://wa.me/${CONTACT_WHATSAPP}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <MessageCircle className="h-4 w-4" /> No access to that email? Message support
        </a>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
        <KeyRound className="h-5 w-5" />
      </span>
      <div className="text-center">
        <h2 className="font-display text-lg font-bold">Forgot your password?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the email on your account and we will send a one-time reset link.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="fp-email">Email</Label>
        <Input
          id="fp-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoFocus
        />
      </div>
      <p className="text-xs text-muted-foreground">
        For privacy we show the same confirmation whether or not that address is registered.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send reset link
      </Button>
      <Button type="button" variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Button>
    </form>
  );
}

function VerifyNotice({
  email,
  phone,
  onDone,
}: {
  email: string;
  phone: string;
  onDone: () => void;
}) {
  const { resendConfirmation } = useAuth();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-4 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cat-home/10 text-cat-home">
        <MailCheck className="h-5 w-5" />
      </span>
      <h2 className="font-display text-lg font-bold">Check your email</h2>
      <p className="text-sm text-muted-foreground">
        If <span className="font-medium text-foreground">{email}</span> can be registered, we have
        sent a confirmation link to it.
      </p>

      <ol className="grid gap-3 rounded-xl border bg-secondary/40 p-4 text-left text-sm">
        <li className="flex gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
            1
          </span>
          <span>Open the link in your inbox to confirm the email address.</span>
        </li>
        <li className="flex gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
            2
          </span>
          <span>
            The link brings you back here, and we text a six-digit code to{" "}
            <span className="font-medium text-foreground">{maskPhone(phone)}</span>.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
            3
          </span>
          <span>Enter that code to finish setting up your account.</span>
        </li>
      </ol>

      <p className="text-xs text-muted-foreground">
        The SMS code is sent as soon as the email is confirmed. If it does not arrive, use “Send a new
        code” on the next screen. Check spam or promotions if the email does not arrive.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        variant="outline"
        disabled={sent}
        onClick={async () => {
          const result = await resendConfirmation(email);
          if (result.ok) setSent(true);
          else setError(messageFor(result.code));
        }}
      >
        {sent ? "Email sent again" : "Send the email again"}
      </Button>
      <Button variant="ghost" onClick={onDone}>
        Back to sign in
      </Button>
    </div>
  );
}
