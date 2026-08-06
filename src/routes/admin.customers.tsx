import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { StatusBadge } from "@/components/kb/status-badge";
import { adminNav } from "@/components/admin/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { customersCrm, orders, repairs, formatTZS } from "@/lib/data";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customer CRM | KBestoreTZ Admin" },
      { name: "description", content: "View customer profiles, order and repair history, tiers and loyalty progress." },
      { property: "og:title", content: "Customer CRM | KBestoreTZ Admin" },
      { property: "og:description", content: "View customer profiles, order and repair history, tiers and loyalty progress." },
    ],
  }),
  component: AdminCustomers,
});

const tierTone: Record<string, "neutral" | "info" | "success" | "warning"> = {
  Bronze: "neutral",
  Silver: "info",
  Gold: "warning",
  Corporate: "success",
};

const tierThresholds: Record<string, number> = {
  Bronze: 2000000,
  Silver: 5000000,
  Gold: 10000000,
  Corporate: 100000000,
};

function AdminCustomers() {
  const [selected, setSelected] = useState(customersCrm[0]!);

  const customerOrders = orders.filter((o) => o.customer === selected.name);
  const customerRepairs = repairs.filter((r) => r.customer === selected.name);
  const target = tierThresholds[selected.tier] ?? 5000000;
  const progress = Math.min(100, Math.round((selected.spend / target) * 100));

  return (
    <DashboardShell title="Customers" subtitle="CRM: profiles, history and loyalty" workspace="Admin console" nav={adminNav}>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Customer list</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Repairs</TableHead>
                  <TableHead>Lifetime spend</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersCrm.map((c) => (
                  <TableRow
                    key={c.name}
                    onClick={() => setSelected(c)}
                    className={cn("cursor-pointer", selected.name === c.name && "bg-accent/5")}
                  >
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <StatusBadge label={c.tier} tone={tierTone[c.tier] ?? "neutral"} />
                    </TableCell>
                    <TableCell>{c.orders}</TableCell>
                    <TableCell>{c.repairs}</TableCell>
                    <TableCell>{formatTZS(c.spend)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.last}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">{selected.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tier</span>
              <StatusBadge label={selected.tier} tone={tierTone[selected.tier] ?? "neutral"} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Loyalty progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="font-semibold">{selected.orders}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Repairs</p>
                <p className="font-semibold">{selected.repairs}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lifetime spend</p>
                <p className="font-semibold">{formatTZS(selected.spend)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last activity</p>
                <p className="font-semibold">{selected.last}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Order history</p>
              <ScrollArea className="h-32 pr-2">
                <div className="space-y-2">
                  {customerOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No orders yet.</p>
                  ) : (
                    customerOrders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-md border p-2 text-xs">
                        <span>{o.id}</span>
                        <span className="text-muted-foreground">{formatTZS(o.total)}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Repair history</p>
              <div className="space-y-2">
                {customerRepairs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No repair tickets yet.</p>
                ) : (
                  customerRepairs.map((r) => (
                    <div key={r.ticket} className="flex items-center justify-between rounded-md border p-2 text-xs">
                      <span>{r.device}</span>
                      <StatusBadge label={r.stage} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
