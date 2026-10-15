import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Roles and access
 * ----------------
 * admin       – full store console (/admin/*) and the technician workspace
 * technician  – technician workspace (/technician) only
 * customer    – storefront and own account only
 *
 * IMPORTANT: this is a front-end access layer. Until a real backend
 * (e.g. Lovable Cloud / Supabase Auth + database row-level security) is
 * connected, sign-in below is PREVIEW ONLY: it decides what the interface
 * shows, but it cannot stop someone from reading data that ships in the
 * browser bundle. Replace the body of `signIn` / `signOut` and the session
 * loading effect with the real auth provider; everything that consumes
 * `useAuth()` (route guards, header, dashboards) will keep working unchanged.
 */
export type Role = "admin" | "technician" | "customer";

export type AuthUser = {
  name: string;
  email: string;
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

const STORAGE_KEY = "kb.auth.v1";
const ROLES: Role[] = ["admin", "technician", "customer"];

type AuthContextValue = {
  user: AuthUser | null;
  /** False until the stored session has been read on the client. */
  ready: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser> | null;
    if (
      parsed &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      ROLES.includes(parsed.role as Role)
    ) {
      return { name: parsed.name, email: parsed.email, role: parsed.role as Role };
    }
  } catch {
    // Storage unavailable or corrupted – treat as signed out.
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setReady(true);
  }, []);

  const signIn = useCallback((next: AuthUser) => {
    setUser(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore – the session still works for this page view.
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
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
    () => ({ user, ready, signIn, signOut, hasRole }),
    [user, ready, signIn, signOut, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
