import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, Minus, Plus, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { PublicShell } from "@/components/kb/public-shell";
import { DeviceVisual } from "@/components/kb/device-visual";
import { ProductCard } from "@/components/kb/product-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useCart } from "@/lib/cart";
import { formatTZS, productById, products, reviews } from "@/lib/data";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
  head: ({ params }) => {
    const product = productById(params.productId);
    const title = product ? `${product.name} | KBestoreTZ` : "Product not found | KBestoreTZ";
    const description = product
      ? product.tagline
      : "This product could not be found in the KBestoreTZ catalogue.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const product = productById(productId);
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  const related = useMemo(() => {
    if (!product) return [];
    const sameCategory = products.filter((p) => p.category === product.category && p.id !== product.id);
    const pool = sameCategory.length > 0 ? sameCategory : products.filter((p) => p.id !== product.id);
    return pool.slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <PublicShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
          <p className="eyebrow text-accent">404</p>
          <h1 className="font-display text-3xl font-bold">Product not found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t find the product you&apos;re looking for. It may have been removed or sold out.
          </p>
          <Link to="/products">
            <Button className="mt-2">Back to store</Button>
          </Link>
        </div>
      </PublicShell>
    );
  }

  const productReviews = reviews.map((r, i) => ({ ...r, id: `${product.id}-review-${i}` }));

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/products" className="hover:text-foreground">
            Store
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <DeviceVisual product={product} className="h-80 rounded-2xl sm:h-[26rem]" />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={activeThumb === i}
                  className={`rounded-xl border-2 transition-colors ${
                    activeThumb === i ? "border-accent" : "border-transparent"
                  }`}
                >
                  <DeviceVisual product={product} className="h-16 rounded-lg sm:h-20" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {product.brand}
              </span>
              {product.badge ? (
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  {product.badge}
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {product.rating}
              </span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>
            <p className="mt-4 text-muted-foreground">{product.tagline}</p>

            <div className="mt-6 flex items-end gap-3">
              <p className="font-display text-3xl font-bold">{formatTZS(product.price)}</p>
              {product.compareAt ? (
                <p className="mb-1 text-muted-foreground line-through">{formatTZS(product.compareAt)}</p>
              ) : null}
            </div>

            <p className={`mt-2 text-sm ${product.stock > 5 ? "text-success" : "text-warning-foreground"}`}>
              {product.stock > 0 ? `In stock · ${product.stock} units available` : "Out of stock"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{product.warranty}</p>

            <Separator className="my-6" />

            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full border">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                  {qty}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  add(product.id, qty);
                  toast.success("Added to cart", { description: `${qty} × ${product.name}` });
                }}
              >
                Add to cart
              </Button>
              <Button
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  add(product.id, qty);
                  navigate({ to: "/checkout" });
                }}
              >
                Buy now
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm">
                <BadgeCheck className="h-5 w-5 shrink-0 text-accent" />
                <span>Genuine products</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm">
                <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
                <span>Warranty included</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm">
                <Truck className="h-5 w-5 shrink-0 text-accent" />
                <span>Nationwide delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-bold">Specifications</h2>
            <div className="mt-4 overflow-hidden rounded-xl border">
              <Table>
                <TableBody>
                  {product.specs.map((spec) => (
                    <TableRow key={spec.label}>
                      <TableCell className="w-1/3 font-medium text-muted-foreground">{spec.label}</TableCell>
                      <TableCell>{spec.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Customer reviews</h2>
              <span className="inline-flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {product.rating} · {product.reviews} reviews
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {productReviews.map((review) => (
                <div key={review.id} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{review.name}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {review.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{review.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-16">
            <h2 className="mb-5 font-display text-xl font-bold">You may also like</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PublicShell>
  );
}
