import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, DollarSign, ShoppingCart, Users, Wrench } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { StatusBadge } from "@/components/kb/status-badge";
import { adminNav } from "@/components/admin/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { orders, repairs, technicians, inventory, customersCrm, salesTrend, formatTZS } from "@/lib/data";

export const Route = createFileRoute("/admin/")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Admin Overview | KBestoreTZ" },
      { name: "description", content: "Store performance overview for KBestoreTZ admins: revenue, orders, repairs and inventory alerts." },
      { property: "og:title", content: "Admin Overview | KBestoreTZ" },
      { property: "og:description", content: "Store performance overview for KBestoreTZ admins: revenue, orders, repairs and inventory alerts." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeRepairs = repairs.filter((r) => r.stage !== "Completed" && r.stage !== "Collected").length;
  const lowStock = inventory.filter((i) => i.stock <= i.reorder);

  const kpis = [
    { label: "Revenue (30d)", value: formatTZS(totalRevenue), delta: "+12.4%", icon: DollarSign },
    { label: "Orders", value: String(orders.length), delta: "+6.1%", icon: ShoppingCart },
    { label: "Active repairs", value: String(activeRepairs), delta: "+3", icon: Wrench },
    { label: "Customers", value: String(customersCrm.length), delta: "+4.8%", icon: Users },
  ];

  return (
    <DashboardShell title="Overview" subtitle="Store performance at a glance" workspace="Admin console" nav={adminNav}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-muted-foreground">{k.label}</p>
                <k.icon className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{k.value}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <ArrowUpRight className="h-3 w-3" /> {k.delta} vs last period
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="shadow-card border-warning/30 sm:col-span-2 lg:col-span-4">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm">
              <span className="font-semibold">{lowStock.length} items</span> are at or below reorder point.{" "}
              <Link to="/admin/inventory" className="text-accent underline underline-offset-2">
                Review inventory
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Revenue &amp; repair trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="repairsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="var(--accent)" fill="url(#sales)" strokeWidth={2} />
                <Area type="monotone" dataKey="repairs" name="Repairs" stroke="var(--success)" fill="url(#repairsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Technician workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {technicians.map((t) => (
              <div key={t.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.load}%</span>
                </div>
                <Progress value={t.load} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base">Recent orders</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/products">View products</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell>{formatTZS(o.total)}</TableCell>
                    <TableCell>
                      <StatusBadge label={o.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Repair queue snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {repairs.slice(0, 4).map((r) => (
              <div key={r.ticket} className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.device}</p>
                </div>
                <StatusBadge label={r.stage} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Inventory alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reorder point</TableHead>
                <TableHead>Supplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((i) => (
                <TableRow key={i.sku}>
                  <TableCell className="font-mono text-xs">{i.sku}</TableCell>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>
                    <StatusBadge label="Low stock" />
                    <span className="ml-2">{i.stock}</span>
                  </TableCell>
                  <TableCell>{i.reorder}</TableCell>
                  <TableCell className="text-muted-foreground">{i.supplier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
