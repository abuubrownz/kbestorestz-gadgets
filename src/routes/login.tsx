import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PublicShell } from "@/components/kb/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { roleHome, roleLabels, useAuth, type Role } from "@/lib/auth";

/** Only allow same-site relative paths as a post-login destination. */
function safeRedirect(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : undefined;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: safeRedirect(search.redirect),
  }),
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Sign in | KBestoreTZ" },
      { name: "description", content: "Sign in to your KBestoreTZ account or staff workspace." },
      { property: "og:title", content: "Sign in | KBestoreTZ" },
      { property: "og:description", content: "Sign in to your KBestoreTZ account or staff workspace." },
    ],
  }),
  component: LoginPage,
});

const roleHints: Record<Role, string> = {
  admin: "Full store console: products, repairs, inventory, customers and analytics.",
  technician: "Technician workspace for assigned repairs only.",
  customer: "Storefront, orders and repair tracking.",
};

function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("customer");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;
    const name = cleanEmail.split("@")[0].replace(/[._-]+/g, " ") || "Guest";
    signIn({
      name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      role,
    });
    router.history.push(redirect ?? roleHome[role]);
  }

  return (
    <PublicShell>
      <div className="mx-auto grid max-w-md gap-4 px-4 py-14 sm:px-6">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your account or the KBestoreTZ staff workspace.
          </p>
        </div>

        <Card className="p-6 shadow-card">
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Sign in as</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as Role)}>
                {(["admin", "technician", "customer"] as Role[]).map((r) => (
                  <Label
                    key={r}
                    htmlFor={`role-${r}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/5"
                  >
                    <RadioGroupItem id={`role-${r}`} value={r} className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">{roleLabels[r]}</span>
                      <span className="block text-xs text-muted-foreground">{roleHints[r]}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Card>

        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Preview sign-in: roles control what the interface shows, but no password or server
            check is applied yet. Connect backend authentication before relying on this to protect
            real data.
          </p>
        </div>
      </div>
    </PublicShell>
  );
}
