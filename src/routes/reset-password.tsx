import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, KeyRound, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PublicShell } from "@/components/kb/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Choose a new password | KBestoreTZ" },
      { name: "description", content: "Choose a new password for your KBestoreTZ account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { user, ready, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password.length > 72) {
      setError("Use between 8 and 72 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.ok) setDone(true);
    else setError("We could not change the password. The link may have expired: request a new one.");
  }

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-md gap-4 px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
            <KeyRound className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Choose a new password</h1>
        </div>
        <Card className="p-6 shadow-card">
          {!ready ? (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking your link…
            </p>
          ) : !user ? (
            <div className="grid gap-4 text-center text-sm">
              <p className="text-muted-foreground">
                This reset link is invalid or has expired. Request a new one from the sign-in page.
              </p>
              <Link to="/login" search={{}}>
                <Button className="w-full">Go to sign in</Button>
              </Link>
            </div>
          ) : done ? (
            <div className="grid gap-4 text-center text-sm">
              <CircleCheck className="mx-auto h-8 w-8 text-cat-home" />
              <p>Your password has been changed.</p>
              <Link to="/account">
                <Button className="w-full">Continue</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4" noValidate>
              <div className="grid gap-2">
                <Label htmlFor="rp-password">New password</Label>
                <Input
                  id="rp-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rp-confirm">Confirm new password</Label>
                <Input
                  id="rp-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </PublicShell>
  );
}
