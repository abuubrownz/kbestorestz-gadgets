import { Link } from "@tanstack/react-router";
import { Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatTZS, type Product } from "@/lib/data";
import { themeFor } from "@/lib/storefront-theme";
import { cn } from "@/lib/utils";
import { DeviceVisual } from "./device-visual";

const LOW_STOCK_AT = 5;

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { add } = useCart();
  const theme = themeFor(product.category);
  const onSale = typeof product.compareAt === "number" && product.compareAt > product.price;
  const savePct = onSale
    ? Math.round((1 - product.price / (product.compareAt as number)) * 100)
    : 0;
  const lowStock = product.stock <= LOW_STOCK_AT;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift",
        theme.hover,
        className,
      )}
    >
      <span aria-hidden className={cn("absolute inset-x-0 top-0 z-10 h-1", theme.bar)} />
      <Link
        to="/products/$productId"
        params={{ productId: product.id }}
        className="relative block focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <DeviceVisual product={product} className="h-44" />
        {onSale ? (
          <span className="absolute top-3 right-3 rounded-full bg-sale px-2.5 py-1 font-display text-[11px] font-bold text-white shadow-md">
            Save {savePct}%
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-wider">{product.brand}</span>
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {product.rating}
            <span className="text-muted-foreground">({product.reviews})</span>
          </span>
        </div>
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className="text-sm font-semibold leading-snug hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className={cn("font-display text-base font-bold", onSale && "text-sale")}>
              {formatTZS(product.price)}
            </p>
            {onSale ? (
              <p className="text-xs text-muted-foreground">
                Was <span className="line-through">{formatTZS(product.compareAt as number)}</span>
              </p>
            ) : null}
            <p className={cn("mt-0.5 text-xs", lowStock ? "text-warning" : "text-success")}>
              {lowStock ? `Only ${product.stock} left` : `In stock · ${product.stock} units`}
            </p>
          </div>
          <Button
            size="icon"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              add(product.id);
              toast.success("Added to cart", { description: product.name });
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
