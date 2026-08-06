import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { adminNav } from "@/components/admin/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orders, salesTrend, categoryPerformance, customerGrowth, repairs, formatTZS } from "@/lib/data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | KBestoreTZ Admin" },
      { name: "description", content: "Sales trend, category performance, repair turnaround and customer growth analytics." },
      { property: "og:title", content: "Analytics | KBestoreTZ Admin" },
      { property: "og:description", content: "Sales trend, category performance, repair turnaround and customer growth analytics." },
    ],
  }),
  component: AdminAnalytics,
});

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const turnaroundData = salesTrend.map((d, i) => ({
  month: d.month,
  repairs: d.repairs,
  avgTurnaroundHrs: [36, 32, 30, 27, 24, 22, 20][i] ?? 24,
}));

function AdminAnalytics() {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrder = totalRevenue / orders.length;
  const completedRepairs = repairs.filter((r) => r.stage === "Completed" || r.stage === "Collected").length;

  const metrics = [
    { label: "Total revenue", value: formatTZS(totalRevenue) },
    { label: "Avg. order value", value: formatTZS(avgOrder) },
    { label: "Completed repairs", value: String(completedRepairs) },
    { label: "New customers (30d)", value: String(customerGrowth.at(-1)!.customers - customerGrowth.at(-2)!.customers) },
  ];

  return (
    <DashboardShell title="Analytics" subtitle="Performance across sales, repairs and customers" workspace="Admin console" nav={adminNav}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="shadow-card">
            <CardContent className="pt-6">
              <p className="eyebrow text-muted-foreground">{m.label}</p>
              <p className="mt-2 font-display text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Sales trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="salesTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" name="Sales index" stroke="var(--accent)" fill="url(#salesTrendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Category performance</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryPerformance} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categoryPerformance.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Repair volume &amp; turnaround</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnaroundData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="repairs" name="Repairs completed" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgTurnaroundHrs" name="Avg turnaround (hrs)" stroke="var(--warning)" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Customer growth</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowth}>
                <defs>
                  <linearGradient id="custGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="customers" name="Customers" stroke="var(--success)" fill="url(#custGrowthGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
