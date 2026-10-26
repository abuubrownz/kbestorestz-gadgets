import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/kb/dashboard-shell";
import { StatusBadge } from "@/components/kb/status-badge";
import { adminNav } from "@/components/admin/nav";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { categories, products as seedProducts, type Product, formatTZS } from "@/lib/data";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Product Management | KBestoreTZ Admin" },
      { name: "description", content: "Manage the KBestoreTZ catalog: search, filter, edit and add products with pricing and stock." },
      { property: "og:title", content: "Product Management | KBestoreTZ Admin" },
      { property: "og:description", content: "Manage the KBestoreTZ catalog: search, filter, edit and add products with pricing and stock." },
    ],
  }),
  component: AdminProducts,
});

function AdminProducts() {
  const [items, setItems] = useState<Product[]>(seedProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  function saveEdit(updated: Product) {
    setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
    toast.success(`${updated.name} updated`);
  }

  function addProduct(product: Product) {
    setItems((prev) => [product, ...prev]);
    setAddOpen(false);
    toast.success(`${product.name} added to catalog`);
  }

  return (
    <DashboardShell
      title="Products"
      subtitle="Catalog, pricing and stock management"
      workspace="Admin console"
      nav={adminNav}
      actions={
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add product
            </Button>
          </DialogTrigger>
          <ProductFormDialog
            title="Add product"
            description="Create a new catalog entry."
            onSubmit={(p) => addProduct(p)}
          />
        </Dialog>
      }
    >
      <Card className="shadow-card">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products or brands…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-56">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{p.category}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>{formatTZS(p.price)}</TableCell>
                  <TableCell>
                    <span className={p.stock <= 6 ? "font-semibold text-warning-foreground" : undefined}>{p.stock}</span>
                    {p.stock <= 6 ? <StatusBadge label="Low stock" className="ml-2" /> : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={p.stock > 0 ? "In stock" : "Low stock"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={editing?.id === p.id} onOpenChange={(open) => setEditing(open ? p : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </DialogTrigger>
                      {editing?.id === p.id ? (
                        <ProductFormDialog
                          title="Edit product"
                          description="Update product details and stock levels."
                          initial={editing}
                          onSubmit={saveEdit}
                        />
                      ) : null}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No products match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function ProductFormDialog({
  title,
  description,
  initial,
  onSubmit,
}: {
  title: string;
  description: string;
  initial?: Product;
  onSubmit: (product: Product) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [categoryValue, setCategoryValue] = useState(initial?.category ?? categories[0]!.slug);
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? ""));
  const [warranty, setWarranty] = useState(initial?.warranty ?? "12 months warranty");
  const [description2, setDescription2] = useState(initial?.tagline ?? "");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="font-display">{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const product: Product = {
            id: initial?.id ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
            name,
            brand,
            category: categoryValue,
            price: Number(price) || 0,
            rating: initial?.rating ?? 4.5,
            reviews: initial?.reviews ?? 0,
            stock: Number(stock) || 0,
            warranty,
            tagline: description2,
            specs: initial?.specs ?? [],
            colorFrom: initial?.colorFrom ?? "#334155",
            colorTo: initial?.colorTo ?? "#0b1120",
          };
          onSubmit(product);
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="p-name">Name</Label>
          <Input id="p-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="p-brand">Brand</Label>
            <Input id="p-brand" required value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={categoryValue} onValueChange={setCategoryValue}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="p-price">Price (TZS)</Label>
            <Input id="p-price" type="number" required value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-stock">Stock</Label>
            <Input id="p-stock" type="number" required value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-warranty">Warranty</Label>
          <Input id="p-warranty" value={warranty} onChange={(e) => setWarranty(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-desc">Description</Label>
          <Textarea id="p-desc" rows={3} value={description2} onChange={(e) => setDescription2(e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="submit">Save product</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
