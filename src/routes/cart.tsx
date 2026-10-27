import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { PublicShell } from "@/components/kb/public-shell";
import { DeviceVisual } from "@/components/kb/device-visual";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { formatTZS } from "@/lib/data";

export const Route = createFileRoute("/cart")({
  staticData: { sitemap: false },
  component: CartPage,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Your cart | KBestoreTZ" },
      { name: "description", content: "Review the items in your KBestoreTZ shopping cart before checkout." },
      { property: "og:title", content: "Your cart | KBestoreTZ" },
      { property: "og:description", content: "Review the items in your KBestoreTZ shopping cart before checkout." },
    ],
  }),
});

const FREE_DELIVERY_THRESHOLD = 1000000;

function CartPage() {
  const { detailed, subtotal, delivery, total, setQty, remove } = useCart();

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="eyebrow text-accent">Cart</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Your shopping cart</h1>
        </header>

        {detailed.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-24 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold">Your cart is empty</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Browse our catalogue of genuine phones, laptops and accessories to get started.
            </p>
            <Link to="/products">
              <Button className="mt-2">Start shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              {subtotal < FREE_DELIVERY_THRESHOLD ? (
                <div className="rounded-xl border bg-accent/5 px-4 py-3 text-sm text-accent">
                  Add {formatTZS(FREE_DELIVERY_THRESHOLD - subtotal)} more to qualify for free delivery.
                </div>
              ) : (
                <div className="rounded-xl border bg-success/10 px-4 py-3 text-sm text-success">
                  You&apos;ve unlocked free delivery on this order.
                </div>
              )}

              {detailed.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-card sm:flex-row sm:items-center"
                >
                  <Link
                    to="/products/$productId"
                    params={{ productId: product.id }}
                    className="shrink-0"
                  >
                    <DeviceVisual product={product} className="h-24 w-24 rounded-xl sm:h-20 sm:w-20" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/products/$productId"
                      params={{ productId: product.id }}
                      className="line-clamp-1 text-sm font-semibold hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{product.brand}</p>
                    <p className="mt-1 font-display text-sm font-semibold">{formatTZS(product.price)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="inline-flex items-center rounded-full border">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => setQty(product.id, qty - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{qty}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Increase quantity of ${product.name}`}
                        onClick={() => setQty(product.id, qty + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${product.name} from cart`}
                      onClick={() => remove(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold">Order summary</h2>
                <div className="mt-4 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">{formatTZS(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-foreground">{delivery === 0 ? "Free" : formatTZS(delivery)}</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-display text-base font-bold">
                  <span>Total</span>
                  <span>{formatTZS(total)}</span>
                </div>
                <Link to="/checkout" className="mt-6 block">
                  <Button className="w-full" size="lg">
                    Proceed to checkout
                  </Button>
                </Link>
                <Link to="/products" className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
