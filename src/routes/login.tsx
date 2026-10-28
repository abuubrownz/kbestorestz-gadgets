import { createFileRoute, useRouter } from "@tanstack/react-router";
import { CircleCheck, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { PublicShell } from "@/components/kb/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roleHome, useAuth, type AuthErrorCode } from "@/lib/auth";

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
      return "Too many attempts. Please wait a few minutes and try again.";
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

function LoginPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  // Once a session exists (just signed in, or already signed in), leave this page.
  useEffect(() => {
    if (ready && user) router.history.push(redirect ?? roleHome[user.role]);
  }, [ready, user, redirect, router]);

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-md gap-4 px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Your KBestoreTZ account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in, or create an account to track your orders and repairs.
          </p>
        </div>

        <Card className="p-6 shadow-card">
          {verifyEmail ? (
            <VerifyNotice
              email={verifyEmail}
              onDone={() => {
                setVerifyEmail(null);
                setTab("signin");
              }}
            />
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="register">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-5">
                <SignInForm />
              </TabsContent>
              <TabsContent value="register" className="mt-5">
                <RegisterForm onRegistered={setVerifyEmail} />
              </TabsContent>
            </Tabs>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Staff accounts (technician, administrator) are created by KBestoreTZ management. Creating
          an account here always gives customer access.
        </p>
      </div>
    </PublicShell>
  );
}

function SignInForm() {
  const { signInWithPassword, resendConfirmation, sendPasswordReset } = useAuth();
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

  async function onForgot() {
    setInfo(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrors({ email: "Enter your email above first." });
      return;
    }
    setErrors({});
    await sendPasswordReset(parsed.data);
    // Same message whether or not the address has an account.
    setInfo("If that email has an account, we have sent a link to reset the password.");
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
        <Input
          id="si-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        onClick={onForgot}
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Forgot your password?
      </button>
    </form>
  );
}

function RegisterForm({ onRegistered }: { onRegistered: (email: string) => void }) {
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
    const result = await register({
      fullName: parsed.data.fullName,
      phone: normalizePhone(parsed.data.phone) ?? parsed.data.phone,
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (result.ok) onRegistered(parsed.data.email);
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
        <Input
          id="rg-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
        />
        <FieldError message={errors["password"]} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="rg-confirm">Confirm password</Label>
        <Input
          id="rg-confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={set("confirm")}
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
      <p className="text-center text-xs text-muted-foreground">
        We will email you a link to confirm your address before you can sign in.
      </p>
    </form>
  );
}

function VerifyNotice({ email, onDone }: { email: string; onDone: () => void }) {
  const { resendConfirmation } = useAuth();
  const [sent, setSent] = useState(false);

  return (
    <div className="grid gap-4 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cat-home/10 text-cat-home">
        <MailCheck className="h-5 w-5" />
      </span>
      <h2 className="font-display text-lg font-bold">Check your email</h2>
      <p className="text-sm text-muted-foreground">
        If <span className="font-medium text-foreground">{email}</span> can be registered, we have
        sent a confirmation link to it. Open the link, then come back here to sign in. Check your
        spam folder if you do not see it.
      </p>
      <Button
        variant="outline"
        disabled={sent}
        onClick={async () => {
          await resendConfirmation(email);
          setSent(true);
        }}
      >
        {sent ? "Email sent again" : "Send it again"}
      </Button>
      <Button variant="ghost" onClick={onDone}>
        Back to sign in
      </Button>
    </div>
  );
}
