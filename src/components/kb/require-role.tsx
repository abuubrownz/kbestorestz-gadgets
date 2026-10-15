import { Link, useLocation } from "@tanstack/react-router";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { roleHome, roleLabels, useAuth, type Role } from "@/lib/auth";

/**
 * Renders `children` only when the signed-in user has one of the `allow` roles.
 * Otherwise shows a sign-in prompt (signed out) or a "no access" screen
 * (signed in with the wrong role). Children are never mounted for blocked users.
 */
export function RequireRole({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const pathname = useLocation({ select: (l) => l.pathname });

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
        </div>
      </div>
    );
  }

  if (user && allow.includes(user.role)) return <>{children}</>;

  const signedOut = !user;

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-4">
      <Card className="w-full max-w-md p-8 text-center shadow-card">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
          {signedOut ? <Lock className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">
          {signedOut ? "Sign in to continue" : "You don't have access"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {signedOut
            ? "This area is restricted to KBestoreTZ staff."
            : `Your account (${roleLabels[user.role]}) can't open this area. It requires ${allow
                .map((r) => roleLabels[r])
                .join(" or ")} access.`}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {signedOut ? (
            <Link to="/login" search={{ redirect: pathname }}>
              <Button className="w-full sm:w-auto">Sign in</Button>
            </Link>
          ) : (
            <>
              <Link to={roleHome[user.role] as "/"}>
                <Button className="w-full sm:w-auto">Go to my dashboard</Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                Switch account
              </Button>
            </>
          )}
          <Link to="/">
            <Button variant="ghost" className="w-full sm:w-auto">
              Back to storefront
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
