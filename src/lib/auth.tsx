import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Roles and access
 * ----------------
 * admin       – full store console (/admin/*) and the technician workspace
 * technician  – technician workspace (/technician) only
 * customer    – storefront and own account only
 *
 * Accounts are real Supabase Auth users: they register with an email address and password
 * and must confirm that address before they can sign in. Roles are read from the
 * `user_roles` table (see supabase/migrations). Nobody can choose their own role: everyone
 * who registers is a customer, and staff roles are granted by the owner in the database.
 *
 * The route guards in this app only decide what the interface shows. Real protection of data
 * comes from row-level security in the database, so every table must have its own policies.
 */
export type Role = "admin" | "technician" | "customer";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
};

export const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  technician: "Technician",
  customer: "Customer",
};

/** Where each role lands after signing in. */
export const roleHome: Record<Role, string> = {
  admin: "/admin",
  technician: "/technician",
  customer: "/account",
};

/** Highest privilege first: a user holding several roles acts as the highest one. */
const ROLE_PRIORITY: Role[] = ["admin", "technician", "customer"];

export type RegisterInput = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

export type AuthResult = { ok: true } | { ok: false; code: AuthErrorCode };

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "weak_password"
  | "rate_limited"
  | "network"
  | "unknown";

type AuthContextValue = {
  user: AuthUser | null;
  /** False until the stored session (and its role) has been read on the client. */
  ready: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  /** Creates the account and sends the confirmation email. The user is NOT signed in yet. */
  register: (input: RegisterInput) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toErrorCode(error: { message?: string; code?: string; status?: number }): AuthErrorCode {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "email_not_confirmed";
  }
  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "invalid_credentials";
  }
  if (code === "weak_password" || message.includes("password")) return "weak_password";
  if (error.status === 429 || code.includes("rate_limit") || message.includes("rate limit")) {
    return "rate_limited";
  }
  if (message.includes("fetch") || message.includes("network")) return "network";
  return "unknown";
}

async function loadAuthUser(session: Session): Promise<AuthUser> {
  const authUser = session.user;
  const [rolesResult, profileResult] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", authUser.id),
    supabase.from("profiles").select("full_name, phone").eq("id", authUser.id).maybeSingle(),
  ]);

  // If roles cannot be read, fall back to the LOWEST privilege - never grant more on error.
  const held = new Set<Role>((rolesResult.data ?? []).map((r) => r.role));
  const role = ROLE_PRIORITY.find((r) => held.has(r)) ?? "customer";

  const metadata = authUser.user_metadata as { full_name?: unknown; phone?: unknown } | null;
  const metaName = typeof metadata?.full_name === "string" ? metadata.full_name : "";
  const email = authUser.email ?? "";
  const name = profileResult.data?.full_name || metaName || email.split("@")[0] || "Customer";

  return {
    id: authUser.id,
    name,
    email,
    phone: profileResult.data?.phone ?? (typeof metadata?.phone === "string" ? metadata.phone : null),
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function apply(session: Session | null) {
      if (!session) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }
      try {
        const next = await loadAuthUser(session);
        if (!cancelled) setUser(next);
      } catch {
        // Could not read the profile or roles: stay signed in as the lowest role.
        if (!cancelled) {
          setUser({
            id: session.user.id,
            name: session.user.email?.split("@")[0] ?? "Customer",
            email: session.user.email ?? "",
            phone: null,
            role: "customer",
          });
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    // Do not call Supabase from inside this callback (it can deadlock the client):
    // hand the work to the next tick instead.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        void apply(session);
      }, 0);
    });

    void supabase.auth
      .getSession()
      .then(({ data: current }) => apply(current.session))
      .catch(() => apply(null));

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? ({ ok: false, code: toErrorCode(error) } as const) : ({ ok: true } as const);
    } catch {
      return { ok: false, code: "network" } as const;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: input.fullName, phone: input.phone },
        },
      });
      // Supabase answers the same way for an address that already has an account, so the
      // page can show one neutral message and never reveal who is registered.
      return error ? ({ ok: false, code: toErrorCode(error) } as const) : ({ ok: true } as const);
    } catch {
      return { ok: false, code: "network" } as const;
    }
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      });
      return error ? ({ ok: false, code: toErrorCode(error) } as const) : ({ ok: true } as const);
    } catch {
      return { ok: false, code: "network" } as const;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return error ? ({ ok: false, code: toErrorCode(error) } as const) : ({ ok: true } as const);
    } catch {
      return { ok: false, code: "network" } as const;
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return error ? ({ ok: false, code: toErrorCode(error) } as const) : ({ ok: true } as const);
    } catch {
      return { ok: false, code: "network" } as const;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (roles: Role | Role[]) => {
      if (!user) return false;
      return (Array.isArray(roles) ? roles : [roles]).includes(user.role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      signInWithPassword,
      register,
      resendConfirmation,
      sendPasswordReset,
      updatePassword,
      signOut,
      hasRole,
    }),
    [
      user,
      ready,
      signInWithPassword,
      register,
      resendConfirmation,
      sendPasswordReset,
      updatePassword,
      signOut,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
