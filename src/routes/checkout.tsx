import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, CheckCircle2, CreditCard, Smartphone, Wallet, Banknote } from "lucide-react";
import { PublicShell } from "@/components/kb/public-shell";
import { DemoConfirmNotice } from "@/components/kb/demo-notice";
import { DeviceVisual } from "@/components/kb/device-visual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart";
import { formatTZS } from "@/lib/data";

export const Route = createFileRoute("/checkout")({
  staticData: { sitemap: false },
  component: CheckoutPage,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Checkout | KBestoreTZ" },
      { name: "description", content: "Complete your order with M-Pesa, Airtel Money, Tigo Pesa, card or cash on delivery." },
      { property: "og:title", content: "Checkout | KBestoreTZ" },
      { property: "og:description", content: "Complete your order with M-Pesa, Airtel Money, Tigo Pesa, card or cash on delivery." },
    ],
  }),
});

const STEPS = ["Customer information", "Delivery address", "Payment method"] as const;

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa", icon: Smartphone },
  { value: "airtel", label: "Airtel Money", icon: Smartphone },
  { value: "tigo", label: "Tigo Pesa", icon: Wallet },
  { value: "card", label: "Debit / Credit card", icon: CreditCard },
  { value: "cod", label: "Cash on delivery", icon: Banknote },
] as const;

const ORDER_TIMELINE = ["Pending", "Processing", "Shipped", "Delivered"] as const;

function generateOrderNumber() {
  return `KB-ORD-${Math.floor(10000 + Math.random() * 89999)}`;
}

function CheckoutPage() {
  const { detailed, subtotal, delivery, total, clear } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ street: "", city: "", region: "", notes: "" });
  const [payment, setPayment] = useState<(typeof PAYMENT_OPTIONS)[number]["value"]>("mpesa");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const canContinue = useMemo(() => {
    if (step === 0) return customer.name.trim() && customer.phone.trim();
    if (step === 1) return address.street.trim() && address.city.trim();
    return true;
  }, [step, customer, address]);

  if (detailed.length === 0 && !orderNumber) {
    return (
      <PublicShell>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-32 text-center">
          <p className="eyebrow text-accent">Checkout</p>
          <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add products to your cart before proceeding to checkout.</p>
          <Link to="/products">
            <Button className="mt-2">Browse products</Button>
          </Link>
        </div>
      </PublicShell>
    );
  }

  if (orderNumber) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="font-display text-3xl font-bold">Order preview (not saved)</h1>
            <p className="text-muted-foreground">
              Thank you{customer.name ? `, ${customer.name}` : ""}. This was a demo checkout, so no order was recorded.
            </p>
            <p className="rounded-full border bg-card px-4 py-1.5 font-display text-sm font-semibold">
              {orderNumber}
            </p>
            <DemoConfirmNotice what="order" />
          </div>

          <div className="mt-10 rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold">Order status</h2>
            <ol className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {ORDER_TIMELINE.map((label, i) => (
                <li key={label} className="flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                      i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i === 0 ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    {i === 0 ? <p className="text-xs text-success">Current status</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/account">
              <Button className="w-full sm:w-auto">View my orders</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue shopping
              </Button>
            </Link>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="eyebrow text-accent">Checkout</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Complete your order</h1>
        </header>

        <div className="mb-8 flex items-center gap-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                    i <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`hidden text-sm font-medium sm:block ${i === step ? "" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 ? <Separator className="flex-1" /> : null}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              {step === 0 ? (
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-lg font-bold">Customer information</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="e.g. Amina Mushi"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input
                        id="phone"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="+255 7xx xxx xxx"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-lg font-bold">Delivery address</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="street">Street address</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="Street, ward, house number"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Dar es Salaam"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={address.region}
                        onChange={(e) => setAddress({ ...address, region: e.target.value })}
                        placeholder="Ilala"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor="notes">Delivery notes (optional)</Label>
                      <Input
                        id="notes"
                        value={address.notes}
                        onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                        placeholder="Landmark or gate instructions"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-lg font-bold">Payment method</h2>
                  <RadioGroup value={payment} onValueChange={(v) => setPayment(v as typeof payment)}>
                    {PAYMENT_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Label
                          key={option.value}
                          htmlFor={option.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-medium transition-colors ${
                            payment === option.value ? "border-accent bg-accent/5" : "hover:bg-secondary/60"
                          }`}
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Icon className="h-4 w-4 text-accent" />
                          {option.label}
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              ) : null}

              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canContinue}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const num = generateOrderNumber();
                      setOrderNumber(num);
                      clear();
                    }}
                  >
                    Confirm order
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-bold">Order summary</h2>
              <div className="mt-4 flex flex-col gap-3">
                {detailed.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <DeviceVisual product={product} className="h-12 w-12 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {qty}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{formatTZS(product.price * qty)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2 text-sm">
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
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
