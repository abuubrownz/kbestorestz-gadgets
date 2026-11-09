import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Roles and access
 * ----------------
 * customer        – storefront and own account
 * technician      – assigned repairs and the technician workspace
 * store_manager   – assigned branch operations (/manager workspace)
 * admin           – daily operations (/admin console)
 * finance_officer – payments, invoices, refunds and reconciliation (/finance workspace)
 * super_admin     – global administration, roles, security and audit
 *
 * Accounts are real Supabase Auth users: they register with an email address and password
 * and must confirm that address before they can sign in. Active roles are read from
 * `user_role_assignments` joined with `roles` (see supabase/migrations). Nobody can choose
 * their own role: everyone who registers is a customer, and staff roles are granted by an
 * authorised administrator in the database.
 *
 * The route guards in this app only decide what the interface shows. Real protection of data
 * comes from row-level security in the database, so every table must have its own policies.
 */
export type Role =
  | "super_admin"
  | "admin"
  | "finance_officer"
  | "store_manager"
  | "technician"
  | "customer";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  /** Every active role held, highest privilege first. */
  roles: Role[];
};

export const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  finance_officer: "Finance Officer",
  store_manager: "Store Manager",
  technician: "Technician",
  customer: "Customer",
};

/** Where each role lands after signing in. */
export const roleHome: Record<Role, string> = {
  super_admin: "/admin",
  admin: "/admin",
  // The dedicated /finance and /manager workspaces ship with the permission-guard
  // work; until then these roles use their own account area.
  finance_officer: "/account",
  store_manager: "/account",
  technician: "/technician",
  customer: "/account",
};

/** Highest privilege first: a user holding several roles acts as the highest one. */
const ROLE_PRIORITY: Role[] = [
  "super_admin",
  "admin",
  "finance_officer",
  "store_manager",
  "technician",
  "customer",
];

/** Every role. Self-service routes such as /account and /checkout are open to all of them. */
export const allRoles: Role[] = [...ROLE_PRIORITY];

export type RegisterInput = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

export type AuthResult = { ok: true } | { ok: false; code: AuthErrorCode };
export type PhoneMfaChallenge = {
  factorId: string;
  challengeId: string;
  phone: string;
  isEnrollment: boolean;
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "weak_password"
  | "rate_limited"
  | "network"
  | "invalid_otp"
  | "provider_unavailable"
  | "unknown";

type AuthContextValue = {
  user: AuthUser | null;
  phoneMfaChallenge: PhoneMfaChallenge | null;
  phoneMfaError: string | null;
  /** False until the stored session (and its role) has been read on the client. */
  ready: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  /** Starts the Supabase OAuth redirect. Only providers enabled in Supabase are offered. */
  signInWithOAuth: (provider: "facebook") => Promise<AuthResult>;
  verifyPhoneMfa: (code: string) => Promise<AuthResult>;
  resendPhoneMfa: () => Promise<AuthResult>;
  cancelPhoneMfa: () => Promise<void>;
  /** Creates the account and sends the confirmation email. The user is NOT signed in yet. */
  register: (input: RegisterInput) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toErrorCode(error: {
  message?: string | undefined;
  code?: string | undefined;
  status?: number | undefined;
}): AuthErrorCode {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "email_not_confirmed";
  }
  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("invalid email or password")
  ) {
    return "invalid_credentials";
  }
  if (
    code === "provider_not_enabled" ||
    code === "provider_disabled" ||
    message.includes("provider is not enabled") ||
    message.includes("provider is not supported") ||
    message.includes("unsupported provider")
  ) {
    return "provider_unavailable";
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
  const [assignmentsResult, rolesResult, profileResult] = await Promise.all([
    supabase
      .from("user_role_assignments")
      .select("role_id, revoked_at, expires_at")
      .eq("user_id", authUser.id),
    supabase.from("roles").select("id, code"),
    supabase.from("profiles").select("full_name, phone").eq("id", authUser.id).maybeSingle(),
  ]);

  // If roles cannot be read, fall back to the LOWEST privilege - never grant more on error.
  const roleCodeById = new Map((rolesResult.data ?? []).map((row) => [row.id, row.code as Role]));
  const now = Date.now();
  const held = new Set<Role>();
  for (const assignment of assignmentsResult.data ?? []) {
    if (assignment.revoked_at) continue;
    if (assignment.expires_at && new Date(assignment.expires_at).getTime() <= now) continue;
    const code = roleCodeById.get(assignment.role_id);
    if (code) held.add(code);
  }
  const roles = ROLE_PRIORITY.filter((role) => held.has(role));
  const role = roles[0] ?? "customer";

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
    roles: roles.length > 0 ? roles : ["customer"],
  };
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/[\s\-()]/g, "");
  const match = /^(?:\+?255|0)?([67]\d{8})$/.exec(digits);
  return match ? `+255${match[1]}` : null;
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 4)} ••• ••• ${phone.slice(-3)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [phoneMfaChallenge, setPhoneMfaChallenge] = useState<PhoneMfaChallenge | null>(null);
  const [phoneMfaError, setPhoneMfaError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const challengeRef = useRef<PhoneMfaChallenge | null>(null);

  useEffect(() => {
    let cancelled = false;
    let activeChallengePromise: Promise<PhoneMfaChallenge> | null = null;

    async function beginPhoneMfa(session: Session): Promise<PhoneMfaChallenge> {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verifiedFactor = factorsData.phone[0];
      const unverifiedFactor = factorsData.all.find(
        (factor) => factor.factor_type === "phone" && factor.status === "unverified",
      );
      let factorId = verifiedFactor?.id ?? unverifiedFactor?.id;
      let isEnrollment = Boolean(unverifiedFactor);

      const metadata = session.user.user_metadata as { phone?: unknown } | null;
      let phone = normalizePhone(metadata?.phone);
      if (!phone) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        phone = normalizePhone(profile?.phone);
      }

      if (!factorId) {
        if (!phone) {
          throw new Error("A valid Tanzanian mobile number is required to set up phone verification.");
        }

        const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: "phone",
          phone,
        });
        if (enrollError) throw enrollError;
        factorId = enrolled.id;
        phone = enrolled.phone;
        isEnrollment = true;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;

      return {
        factorId,
        challengeId: challenge.id,
        phone: phone
          ? maskPhone(phone)
          : isEnrollment
            ? "the phone number you provided"
            : "your verified number",
        isEnrollment,
      };
    }

    async function apply(session: Session | null) {
      if (!session) {
        if (!cancelled) {
          setUser(null);
          setPhoneMfaChallenge(null);
          setPhoneMfaError(null);
          challengeRef.current = null;
          activeChallengePromise = null;
          setReady(true);
        }
        return;
      }
      try {
        const { data: assurance, error: assuranceError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assuranceError) throw assuranceError;

        if (assurance.currentLevel !== "aal2") {
          setUser(null);
          setPhoneMfaError(null);
          if (!challengeRef.current) {
            activeChallengePromise ??= beginPhoneMfa(session);
            try {
              challengeRef.current = await activeChallengePromise;
            } catch (error) {
              // Phone sign-in is optional until the Supabase project has a phone provider and a
              // working SMS route. Locking every customer out of a password-only deployment is
              // worse than signing them in at AAL1, so only fail closed when a *verified* phone
              // factor exists (the account really does have a second factor to challenge).
              activeChallengePromise = null;
              const { data: factors, error: factorsError } =
                await supabase.auth.mfa.listFactors();
              const hasVerifiedPhone = !factorsError && (factors?.phone.length ?? 0) > 0;
              if (hasVerifiedPhone) throw error;

              console.warn(
                "[auth] Phone verification could not start; continuing without it.",
                error,
              );
              const next = await loadAuthUser(session);
              if (!cancelled) {
                setUser(next);
                setPhoneMfaChallenge(null);
                setPhoneMfaError(null);
              }
              return;
            }
          }
          if (!cancelled) setPhoneMfaChallenge(challengeRef.current);
          return;
        }

        challengeRef.current = null;
        activeChallengePromise = null;
        if (!cancelled) {
          setPhoneMfaChallenge(null);
          setPhoneMfaError(null);
        }
        const next = await loadAuthUser(session);
        if (!cancelled) setUser(next);
      } catch {
        activeChallengePromise = null;
        if (!cancelled) {
          setUser(null);
          setPhoneMfaChallenge(null);
          setPhoneMfaError(
            "We could not start phone verification. Check your phone number and SMS setup, then sign in again.",
          );
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

  const signInWithOAuth = useCallback(async (provider: "facebook") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // The login page handles the returned session and forwards the user by role.
          redirectTo: `${window.location.origin}/login`,
        },
      });
      return error ? ({ ok: false, code: toErrorCode(error) } as const) : ({ ok: true } as const);
    } catch {
      return { ok: false, code: "network" } as const;
    }
  }, []);

  const verifyPhoneMfa = useCallback(async (code: string): Promise<AuthResult> => {
    const challenge = challengeRef.current;
    if (!challenge || !/^\d{6}$/.test(code)) return { ok: false, code: "invalid_otp" };

    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: challenge.factorId,
        challengeId: challenge.challengeId,
        code,
      });
      if (error) {
        const code = toErrorCode(error);
        return { ok: false, code: code === "rate_limited" ? code : "invalid_otp" };
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) return { ok: false, code: "network" };
      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError || assurance.currentLevel !== "aal2") {
        return { ok: false, code: "unknown" };
      }

      const verifiedUser = await loadAuthUser(sessionData.session);
      challengeRef.current = null;
      setPhoneMfaChallenge(null);
      setPhoneMfaError(null);
      setUser(verifiedUser);
      return { ok: true };
    } catch {
      return { ok: false, code: "network" };
    }
  }, []);

  const resendPhoneMfa = useCallback(async (): Promise<AuthResult> => {
    const challenge = challengeRef.current;
    if (!challenge) return { ok: false, code: "unknown" };
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: challenge.factorId,
      });
      if (error) return { ok: false, code: toErrorCode(error) };
      const updated = { ...challenge, challengeId: data.id };
      challengeRef.current = updated;
      setPhoneMfaChallenge(updated);
      setPhoneMfaError(null);
      return { ok: true };
    } catch {
      return { ok: false, code: "network" };
    }
  }, []);

  const cancelPhoneMfa = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      challengeRef.current = null;
      setPhoneMfaChallenge(null);
      setPhoneMfaError(null);
      setUser(null);
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
      challengeRef.current = null;
      setUser(null);
      setPhoneMfaChallenge(null);
      setPhoneMfaError(null);
    }
  }, []);

  const hasRole = useCallback(
    (roles: Role | Role[]) => {
      if (!user) return false;
      // A Super Admin has global UI access; data access is still checked by RLS.
      if (user.roles.includes("super_admin")) return true;
      const requested = Array.isArray(roles) ? roles : [roles];
      return requested.some((role) => user.roles.includes(role));
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      phoneMfaChallenge,
      phoneMfaError,
      ready,
      signInWithPassword,
      signInWithOAuth,
      verifyPhoneMfa,
      resendPhoneMfa,
      cancelPhoneMfa,
      register,
      resendConfirmation,
      sendPasswordReset,
      updatePassword,
      signOut,
      hasRole,
    }),
    [
      user,
      phoneMfaChallenge,
      phoneMfaError,
      ready,
      signInWithPassword,
      signInWithOAuth,
      verifyPhoneMfa,
      resendPhoneMfa,
      cancelPhoneMfa,
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
