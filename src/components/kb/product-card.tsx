import { Link } from "@tanstack/react-router";
import { Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatTZS, type Product } from "@/lib/data";
import { DeviceVisual } from "./device-visual";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <Link
        to="/products/$productId"
        params={{ productId: product.id }}
        className="block focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <DeviceVisual product={product} className="h-44" />
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
            <p className="font-display text-base font-semibold">{formatTZS(product.price)}</p>
            {product.compareAt ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatTZS(product.compareAt)}
              </p>
            ) : (
              <p className="text-xs text-success">In stock · {product.stock} units</p>
            )}
          </div>
          <Button
            size="icon"
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