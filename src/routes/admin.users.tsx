import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, ShieldCheck, UserCog, Users, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { StatusBadge } from "@/components/kb/status-badge";
import { adminNav } from "@/components/admin/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { roleLabels, type Role } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Users & roles | KBestoreTZ Admin" },
      {
        name: "description",
        content: "Every real KBestoreTZ account with its active customer, staff and administrator roles.",
      },
      { property: "og:title", content: "Users & roles | KBestoreTZ Admin" },
      {
        property: "og:description",
        content: "Every real KBestoreTZ account with its active customer, staff and administrator roles.",
      },
    ],
  }),
  component: AdminUsers,
});

type DirectoryUser = {
  id: string;
  name: string;
  phone: string | null;
  roles: Role[];
  joinedAt: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "setup" }
  | { status: "error"; message: string }
  | { status: "ready"; users: DirectoryUser[] };

const roleOrder: Role[] = [
  "super_admin",
  "admin",
  "finance_officer",
  "store_manager",
  "technician",
  "customer",
];

function roleTone(role: Role): "neutral" | "info" | "success" | "warning" | "danger" {
  if (role === "super_admin") return "danger";
  if (role === "admin") return "info";
  if (role === "finance_officer") return "success";
  if (role === "technician" || role === "store_manager") return "warning";
  return "neutral";
}

function formatJoined(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function AdminUsers() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [role, setRole] = useState<Role | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [profiles, assignments, roles] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("user_role_assignments")
          .select("user_id, role_id, revoked_at, expires_at"),
        supabase.from("roles").select("id, code"),
      ]);
      if (cancelled) return;

      const error = profiles.error ?? assignments.error ?? roles.error;
      if (error) {
        // 42P01 = undefined_table. The RBAC migrations have not been applied yet.
        const missingTable =
          error.code === "42P01" ||
          /does not exist|schema cache|could not find the table/i.test(error.message);
        setState(missingTable ? { status: "setup" } : { status: "error", message: error.message });
        return;
      }

      const codeById = new Map((roles.data ?? []).map((row) => [row.id, row.code as Role]));
      const now = Date.now();
      const rolesByUser = new Map<string, Set<Role>>();

      for (const assignment of assignments.data ?? []) {
        if (assignment.revoked_at) continue;
        if (assignment.expires_at && new Date(assignment.expires_at).getTime() <= now) continue;
        const code = codeById.get(assignment.role_id);
        if (!code) continue;
        const held = rolesByUser.get(assignment.user_id) ?? new Set<Role>();
        held.add(code);
        rolesByUser.set(assignment.user_id, held);
      }

      const users: DirectoryUser[] = (profiles.data ?? []).map((profile) => ({
        id: profile.id,
        name: profile.full_name?.trim() || "Unnamed account",
        phone: profile.phone,
        roles: roleOrder.filter((held) => rolesByUser.get(profile.id)?.has(held)),
        joinedAt: profile.created_at,
      }));

      setState({ status: "ready", users });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const users = state.status === "ready" ? state.users : [];

  const counts = useMemo(() => {
    const result = { all: users.length } as Record<Role | "all", number>;
    for (const key of roleOrder) {
      result[key] = users.filter((user) => user.roles.includes(key)).length;
    }
    return result;
  }, [users]);

  const summary = useMemo(
    () => ({
      customers: users.filter((user) => user.roles.length === 1 && user.roles[0] === "customer")
        .length,
      staff: users.filter((user) =>
        user.roles.some((held) =>
          ["technician", "store_manager", "finance_officer"].includes(held),
        ),
      ).length,
      admins: users.filter((user) => user.roles.some((held) => ["admin", "super_admin"].includes(held)))
        .length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== "all" && !user.roles.includes(role)) return false;
      if (!needle) return true;
      return (
        user.name.toLowerCase().includes(needle) ||
        (user.phone ?? "").toLowerCase().includes(needle)
      );
    });
  }, [users, role, query]);

  return (
    <DashboardShell
      title="Users & roles"
      subtitle="Live accounts from Supabase Auth with active multi-role assignments"
      workspace="Admin console"
      nav={adminNav}
    >
      {state.status === "loading" ? (
        <Card className="shadow-card">
          <CardContent className="flex items-center justify-center gap-2 py-14 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading accounts…
          </CardContent>
        </Card>
      ) : state.status === "setup" ? (
        <Card className="shadow-card">
          <CardContent className="grid max-w-3xl gap-4 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-warning/15 text-warning">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Connect the account tables first</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This page reads <code>profiles</code>, <code>user_role_assignments</code> and{" "}
                <code>roles</code>. Apply the auth and RBAC migrations in order, then reload:
              </p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                    20261028120000_auth_roles_profiles.sql
                  </code>
                </li>
                <li>
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                    20261109120000_rbac_schema.sql
                  </code>
                </li>
                <li>
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                    20261109121000_rbac_seed.sql
                  </code>
                </li>
                <li>
                  <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                    20261109122000_rbac_access.sql
                  </code>
                </li>
              </ol>
            </div>
            <p className="text-sm text-muted-foreground">
              Until the tables exist, every account is treated as a customer. See{" "}
              <code>docs/RBAC.md</code> for the bootstrap SQL that grants the first Super Admin.
            </p>
            <Button variant="outline" className="w-fit" onClick={() => window.location.reload()}>
              Reload after setup
            </Button>
          </CardContent>
        </Card>
      ) : state.status === "error" ? (
        <Card className="shadow-card">
          <CardContent className="grid gap-3 p-6">
            <h2 className="font-display text-lg font-bold">Could not load accounts</h2>
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <Button variant="outline" className="w-fit" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="shadow-card">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="eyebrow text-muted-foreground">Customers</p>
                  <p className="mt-2 font-display text-2xl font-bold">{summary.customers}</p>
                </div>
                <Users className="h-5 w-5 text-accent" />
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="eyebrow text-muted-foreground">Staff</p>
                  <p className="mt-2 font-display text-2xl font-bold">{summary.staff}</p>
                </div>
                <Wrench className="h-5 w-5 text-cat-phone" />
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="eyebrow text-muted-foreground">Administrators</p>
                  <p className="mt-2 font-display text-2xl font-bold">{summary.admins}</p>
                </div>
                <UserCog className="h-5 w-5 text-success" />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="font-display text-base">
                All accounts
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {filtered.length} of {users.length}
                </span>
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name or phone"
                  className="pl-9"
                  aria-label="Search accounts"
                />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {(["all", ...roleOrder] as const).map((key) => {
                  const active = role === key;
                  const label = key === "all" ? "All" : roleLabels[key];
                  const count = counts[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setRole(key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label} <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              {users.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No accounts yet. New registrations appear here automatically.
                </p>
              ) : filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No accounts match this filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Roles</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                            <span className="block text-xs font-normal text-muted-foreground">
                              {user.id.slice(0, 8)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.phone || "Not provided"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.length === 0 ? (
                                <StatusBadge label="No active role" tone="danger" />
                              ) : (
                                user.roles.map((held) => (
                                  <StatusBadge
                                    key={held}
                                    label={roleLabels[held]}
                                    tone={roleTone(held)}
                                  />
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatJoined(user.joinedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Accounts come from Supabase Auth. Roles are granted by an authorised administrator in the
            database; nobody can promote themselves from the website. Staff-wide reads require a
            verified second factor. Email addresses are not shown here because they live in the
            protected auth schema.
          </p>
        </div>
      )}
    </DashboardShell>
  );
}
