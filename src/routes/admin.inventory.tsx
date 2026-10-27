import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { StatusBadge } from "@/components/kb/status-badge";
import { adminNav } from "@/components/admin/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inventory } from "@/lib/data";

export const Route = createFileRoute("/admin/inventory")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Inventory Management | KBestoreTZ Admin" },
      { name: "description", content: "Monitor stock levels, reorder points, suppliers and stock movements for products and spare parts." },
      { property: "og:title", content: "Inventory Management | KBestoreTZ Admin" },
      { property: "og:description", content: "Monitor stock levels, reorder points, suppliers and stock movements for products and spare parts." },
    ],
  }),
  component: AdminInventory,
});

const seedMovements = [
  { id: "MV-1042", sku: "KB-SM-0142", type: "Receipt", qty: 20, date: "2026-08-04", note: "Container arrival" },
  { id: "MV-1041", sku: "KB-PT-1109", type: "Issue", qty: -3, date: "2026-08-04", note: "Repair ticket KB-RP-48219" },
  { id: "MV-1039", sku: "KB-LP-0231", type: "Issue", qty: -2, date: "2026-08-03", note: "Corporate order KB-ORD-90405" },
  { id: "MV-1035", sku: "KB-PT-1142", type: "Receipt", qty: 15, date: "2026-08-02", note: "Supplier restock" },
];

function AdminInventory() {
  const [filter, setFilter] = useState<"all" | "Product" | "Spare part">("all");
  const [movements, setMovements] = useState(seedMovements);
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState(inventory[0]!.sku);
  const [type, setType] = useState("Receipt");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");

  const list = useMemo(() => (filter === "all" ? inventory : inventory.filter((i) => i.type === filter)), [filter]);
  const lowStock = inventory.filter((i) => i.stock <= i.reorder);
  const suppliers = Array.from(new Set(inventory.map((i) => i.supplier)));

  function submitMovement(e: React.FormEvent) {
    e.preventDefault();
    setMovements((prev) => [
      { id: `MV-${1000 + prev.length + 50}`, sku, type, qty: type === "Issue" ? -Math.abs(Number(qty)) : Math.abs(Number(qty)), date: new Date().toISOString().slice(0, 10), note },
      ...prev,
    ]);
    setOpen(false);
    setNote("");
    toast.success("Stock movement recorded");
  }

  return (
    <DashboardShell
      title="Inventory"
      subtitle="Stock levels, movements and suppliers"
      workspace="Admin console"
      nav={adminNav}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Record movement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Record stock movement</DialogTitle>
              <DialogDescription>Log a receipt or issue against an inventory item.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={submitMovement}>
              <div className="grid gap-2">
                <Label>Item</Label>
                <Select value={sku} onValueChange={setSku}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((i) => (
                      <SelectItem key={i.sku} value={i.sku}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receipt">Receipt</SelectItem>
                      <SelectItem value="Issue">Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mv-qty">Quantity</Label>
                  <Input id="mv-qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mv-note">Note</Label>
                <Input id="mv-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason / reference" />
              </div>
              <DialogFooter>
                <Button type="submit">Save movement</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {lowStock.length > 0 ? (
        <Card className="shadow-card border-warning/30">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm">
              <span className="font-semibold">{lowStock.length} items</span> are at or below their reorder point and need restocking.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-4">
        <TabsList>
          <TabsTrigger value="all">All items</TabsTrigger>
          <TabsTrigger value="Product">Products</TabsTrigger>
          <TabsTrigger value="Spare part">Spare parts</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Stock levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {list.map((i) => {
              const pct = Math.min(100, Math.round((i.stock / (i.reorder * 2 || 1)) * 100));
              const low = i.stock <= i.reorder;
              return (
                <div key={i.sku} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{i.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{i.sku} · {i.type}</p>
                    </div>
                    <div className="text-right">
                      {low ? <StatusBadge label="Low stock" /> : <StatusBadge label="In stock" />}
                      <p className="mt-1 text-xs text-muted-foreground">{i.stock} in stock · reorder at {i.reorder}</p>
                    </div>
                  </div>
                  <Progress value={pct} className="mt-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Suppliers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suppliers.map((s) => (
              <div key={s} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{s}</p>
                <p className="text-xs text-muted-foreground">
                  {inventory.filter((i) => i.supplier === s).length} items supplied
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Stock movements</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell className="font-mono text-xs">{m.sku}</TableCell>
                  <TableCell>
                    <StatusBadge label={m.type} tone={m.type === "Receipt" ? "success" : "info"} />
                  </TableCell>
                  <TableCell className={m.qty < 0 ? "text-destructive" : "text-success"}>{m.qty > 0 ? `+${m.qty}` : m.qty}</TableCell>
                  <TableCell className="text-muted-foreground">{m.date}</TableCell>
                  <TableCell className="text-muted-foreground">{m.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
