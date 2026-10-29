import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Wrench,
  Star,
  ShieldCheck,
  Bell,
  Calendar,
  Heart,
} from "lucide-react";
import { PublicShell } from "@/components/kb/public-shell";
import { DeviceVisual } from "@/components/kb/device-visual";
import { StatusBadge } from "@/components/kb/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTZS, orders, products, repairs } from "@/lib/data";

export const Route = createFileRoute("/account")({
  staticData: { sitemap: false },
  component: AccountPage,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "My account | KBestoreTZ" },
      { name: "description", content: "Manage your orders, repairs, appointments, warranties and loyalty points." },
      { property: "og:title", content: "My account | KBestoreTZ" },
      { property: "og:description", content: "Manage your orders, repairs, appointments, warranties and loyalty points." },
    ],
  }),
});

const CUSTOMER_NAME = "Amina Mushi";

const myOrders = orders.filter((o) => o.customer === CUSTOMER_NAME).concat(orders.slice(0, 2));
const myRepairs = repairs.filter((r) => r.customer === CUSTOMER_NAME).concat(repairs.slice(2, 3));

const appointments = [
  { id: "AP-2201", type: "Repair drop-off", device: "iPhone 13 Pro", date: "Aug 9, 2026", time: "10:30 AM", location: "Dar es Salaam — Savei Complex" },
  { id: "AP-2198", type: "Consultation", device: "MacBook Pro 14\"", date: "Aug 12, 2026", time: "2:00 PM", location: "Arusha" },
];

const warranties = [
  { product: "iPhone 15 Pro 256GB", purchased: "Feb 12, 2026", expires: "Feb 12, 2027", status: "Active" },
  { product: "Sony WH-1000XM5", purchased: "Nov 3, 2025", expires: "Nov 3, 2026", status: "Active" },
  { product: "Galaxy Tab S9 FE", purchased: "May 20, 2024", expires: "May 20, 2025", status: "Expired" },
];

const notifications = [
  { id: 1, text: "Your repair KB-RP-48219 has moved to Repairing.", time: "2 hours ago" },
  { id: 2, text: "Order KB-ORD-90412 is now Processing.", time: "1 day ago" },
  { id: 3, text: "Your loyalty tier is close to upgrading to Platinum.", time: "3 days ago" },
  { id: 4, text: "Warranty for Galaxy Tab S9 FE has expired.", time: "1 week ago" },
];

const savedProducts = products.slice(0, 3);

const loyaltyPoints = 3240;
const loyaltyGoal = 5000;
const activeRepairsCount = myRepairs.filter((r) => r.stage !== "Completed" && r.stage !== "Collected").length;

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function AccountPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8 flex flex-col gap-1">
          <p className="eyebrow text-accent">My account</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back, {CUSTOMER_NAME.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Track your orders, repairs, warranties and loyalty rewards in one place.</p>
        </header>

        <Tabs defaultValue="overview">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
            {[
              { value: "overview", label: "Overview" },
              { value: "orders", label: "Orders" },
              { value: "repairs", label: "Repairs" },
              { value: "appointments", label: "Appointments" },
              { value: "warranty", label: "Warranty" },
              { value: "loyalty", label: "Loyalty" },
              { value: "notifications", label: "Notifications" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-full border bg-card px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard icon={Package} label="Orders" value={myOrders.length} />
              <KpiCard icon={Wrench} label="Active repairs" value={activeRepairsCount} />
              <KpiCard icon={Star} label="Loyalty points" value={loyaltyPoints.toLocaleString()} />
              <KpiCard icon={ShieldCheck} label="Warranties" value={warranties.filter((w) => w.status === "Active").length} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold">Saved products</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {savedProducts.map((product) => (
                    <Link
                      key={product.id}
                      to="/products/$productId"
                      params={{ productId: product.id }}
                      className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-secondary/60"
                    >
                      <DeviceVisual product={product} className="h-12 w-12 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatTZS(product.price)}</p>
                      </div>
                      <Heart className="h-4 w-4 shrink-0 fill-destructive text-destructive" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold">Recent notifications</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="flex items-start gap-3 text-sm">
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div>
                        <p>{n.text}</p>
                        <p className="text-xs text-muted-foreground">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="flex flex-col gap-4">
              {myOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-semibold">{order.id}</p>
                      <p className="text-xs text-muted-foreground">Placed {order.date}</p>
                    </div>
                    <StatusBadge label={order.status} />
                  </div>
                  <Separator className="my-3" />
                  <div className="flex flex-col gap-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.qty} × {item.name}
                        </span>
                        <span>{formatTZS(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatTZS(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="repairs" className="mt-6">
            <div className="flex flex-col gap-4">
              {myRepairs.map((repair) => (
                <div key={repair.ticket} className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-semibold">{repair.ticket}</p>
                      <p className="text-xs text-muted-foreground">{repair.device}</p>
                    </div>
                    <StatusBadge label={repair.stage} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{repair.problem}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Technician: {repair.technician}</span>
                    <span className="font-medium">{formatTZS(repair.quote)}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <div className="flex flex-col gap-4">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{a.type} · {a.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.date} at {a.time} — {a.location}
                    </p>
                  </div>
                </div>
              ))}
              <Link to="/repairs/book">
                <Button variant="outline" className="mt-1 w-full sm:w-auto">
                  Book a new appointment
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="warranty" className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {warranties.map((w) => (
                <div key={w.product} className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{w.product}</p>
                    <StatusBadge label={w.status} tone={w.status === "Active" ? "success" : "danger"} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Purchased {w.purchased}</p>
                  <p className="text-xs text-muted-foreground">Expires {w.expires}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="loyalty" className="mt-6">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="eyebrow text-accent">Gold member</p>
                  <h2 className="mt-1 font-display text-2xl font-bold">{loyaltyPoints.toLocaleString()} points</h2>
                </div>
                <Star className="h-8 w-8 fill-warning text-warning" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Earn {loyaltyGoal - loyaltyPoints} more points to reach Platinum tier and unlock free express repairs.
              </p>
              <Progress value={(loyaltyPoints / loyaltyGoal) * 100} className="mt-4" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Gold</span>
                <span>Platinum at {loyaltyGoal.toLocaleString()}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="flex flex-col gap-3">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicShell>
  );
}
