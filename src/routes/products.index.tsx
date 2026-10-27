import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { PublicShell } from "@/components/kb/public-shell";
import { ProductCard } from "@/components/kb/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { brands, categories, products } from "@/lib/data";

export const Route = createFileRoute("/products/")({
  staticData: { sitemap: true },
  component: ProductsPage,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Shop | KBestoreTZ" },
      {
        name: "description",
        content: "Browse genuine phones, laptops, tablets, gaming and accessories at KBestoreTZ.",
      },
      { property: "og:title", content: "Shop | KBestoreTZ" },
      {
        property: "og:description",
        content: "Browse genuine phones, laptops, tablets, gaming and accessories at KBestoreTZ.",
      },
    ],
  }),
});

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "rating", label: "Highest rated" },
] as const;

const MAX_PRICE = Math.max(...products.map((p) => p.price));

function useFilters() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("featured");

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const reset = () => {
    setSearch("");
    setCategory("all");
    setSelectedBrands([]);
    setPriceRange([0, MAX_PRICE]);
    setSort("featured");
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "all" && p.category !== category) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
    return list;
  }, [search, category, selectedBrands, priceRange, sort]);

  return {
    search,
    setSearch,
    category,
    setCategory,
    selectedBrands,
    toggleBrand,
    priceRange,
    setPriceRange,
    sort,
    setSort,
    reset,
    filtered,
  };
}

function FilterPanel({ f }: { f: ReturnType<typeof useFilters> }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-semibold">Category</p>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => f.setCategory("all")}
            className={`rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
              f.category === "all" ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => f.setCategory(c.slug)}
              className={`rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                f.category === c.slug ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-secondary/60"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <p className="mb-3 text-sm font-semibold">Brand</p>
        <div className="flex flex-col gap-2.5">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={f.selectedBrands.includes(brand)}
                onCheckedChange={() => f.toggleBrand(brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="cursor-pointer text-sm font-normal">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <p className="mb-3 text-sm font-semibold">Price range</p>
        <Slider
          min={0}
          max={MAX_PRICE}
          step={50000}
          value={f.priceRange}
          onValueChange={(v) => f.setPriceRange(v as [number, number])}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>TZS {f.priceRange[0].toLocaleString()}</span>
          <span>TZS {f.priceRange[1].toLocaleString()}</span>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={f.reset} className="gap-2">
        <X className="h-3.5 w-3.5" /> Clear filters
      </Button>
    </div>
  );
}

function ProductsPage() {
  const f = useFilters();

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="eyebrow text-accent">Store</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Shop genuine devices &amp; accessories
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Every product ships with an authenticity guarantee, KBestoreTZ warranty and doorstep delivery
            across Tanzania.
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-card">
              <FilterPanel f={f} />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={f.search}
                  onChange={(e) => f.setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9"
                  aria-label="Search products"
                />
              </div>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2 lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetTitle className="font-display">Filters</SheetTitle>
                    <div className="mt-6">
                      <FilterPanel f={f} />
                    </div>
                  </SheetContent>
                </Sheet>
                <Select value={f.sort} onValueChange={(v) => f.setSort(v as typeof f.sort)}>
                  <SelectTrigger className="w-[190px]" aria-label="Sort products">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              {f.filtered.length} {f.filtered.length === 1 ? "product" : "products"} found
            </p>

            {f.filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-24 text-center">
                <p className="font-display text-lg font-semibold">No products match your filters</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Try adjusting your search, price range or clearing filters.
                </p>
                <Button variant="outline" onClick={f.reset}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {f.filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
