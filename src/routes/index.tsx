import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Gamepad2,
  Headphones,
  HousePlug,
  Laptop,
  ShieldCheck,
  Smartphone,
  Star,
  Tablet,
  Timer,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicShell } from "@/components/kb/public-shell";
import { ProductCard } from "@/components/kb/product-card";
import heroDevices from "@/assets/hero-devices.jpg";
import { categories, formatTZS, products, repairServices, reviews } from "@/lib/data";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "KBestoreTZ — Buy, Repair & Upgrade Technology in Tanzania" },
      {
        name: "description",
        content:
          "KBestoreTZ is East Africa's trusted technology destination: genuine smartphones, laptops and gaming gear plus certified device repair with live tracking.",
      },
      { property: "og:title", content: "KBestoreTZ — Your Complete Technology Partner" },
      {
        property: "og:description",
        content:
          "Shop genuine devices and book certified repairs with live tracking across Dar es Salaam, Arusha and Mwanza.",
      },
    ],
  }),
  component: Home,
});

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphones: Smartphone,
  laptops: Laptop,
  tablets: Tablet,
  accessories: Headphones,
  gaming: Gamepad2,
  "smart-home": HousePlug,
};

const reasons = [
  {
    icon: BadgeCheck,
    title: "Genuine products",
    body: "Every device is sourced through authorised distributors and serial-verified before it ships.",
  },
  {
    icon: Wrench,
    title: "Expert technicians",
    body: "Board-level certified engineers with a 90-day workmanship guarantee on all repairs.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty support",
    body: "Warranty and service history stay on your account — no receipts to keep, no queues.",
  },
  {
    icon: Timer,
    title: "Fast service",
    body: "Same-day screen and battery repairs, next-day delivery in Dar es Salaam.",
  },
];

function Home() {
  const [email, setEmail] = useState("");
  const featured = products.slice(0, 8);

  return (
    <PublicShell>
      {/* Hero */}
      <section className="ink-panel relative overflow-hidden">
        <div className="absolute inset-0 grid-noise opacity-30" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/70">
              <Zap className="h-3.5 w-3.5 text-accent" /> East Africa technology ecosystem
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Your complete
              <br />
              technology partner
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/65 sm:text-lg">
              Buy, repair, upgrade and manage your devices with confidence. One platform for
              genuine hardware, certified repairs and ICT services across Tanzania.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" variant="secondary" className="gap-2">
                  Shop now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/repairs/book">
                <Button
                  size="lg"
                  className="gap-2 bg-accent text-accent-foreground shadow-glow hover:bg-accent/90"
                >
                  <Wrench className="h-4 w-4" /> Book repair
                </Button>
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
              {[
                { k: "12,400+", v: "Devices delivered" },
                { k: "3,900+", v: "Repairs completed" },
                { k: "4.9/5", v: "Customer rating" },
              ].map((stat) => (
                <div key={stat.v}>
                  <dt className="font-display text-2xl font-bold">{stat.k}</dt>
                  <dd className="mt-1 text-xs text-white/55">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-lift">
              <img
                src={heroDevices}
                alt="Premium smartphone, laptop and headphones on a dark studio surface"
                width={1440}
                height={1088}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-4 hidden rounded-2xl border bg-background/95 p-4 text-foreground shadow-lift backdrop-blur sm:block">
              <p className="eyebrow text-muted-foreground">Live repair tracking</p>
              <p className="mt-1 text-sm font-semibold">KB-RP-48219 · Testing</p>
              <div className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-4/5 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-accent">Shop by category</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Featured categories</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-accent hover:underline">
            Browse the full store →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] ?? Smartphone;
            return (
              <Link
                key={cat.slug}
                to="/products"
                className="group rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{cat.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cat.blurb}</p>
                <p className="mt-3 text-xs text-accent">{cat.items} products</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Repair services */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow text-accent">Repair platform</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Certified repairs with live tracking
              </h2>
              <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                Book online, drop off or request pickup, then follow every stage — diagnosis,
                quotation, repair, testing — from your dashboard with a tracking number.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/repairs/book">
                  <Button className="gap-2">
                    <Wrench className="h-4 w-4" /> Book repair now
                  </Button>
                </Link>
                <Link to="/repairs/track">
                  <Button variant="outline">Track a repair</Button>
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {repairServices.map((service) => (
                <div key={service.title} className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{service.title}</h3>
                    <span className="eyebrow rounded-full bg-secondary px-2 py-1 text-muted-foreground">
                      {service.turnaround}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{service.detail}</p>
                  <p className="mt-3 text-sm font-semibold text-accent">
                    From {formatTZS(service.from)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-accent">Handpicked</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Featured products</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-accent hover:underline">
            View all products →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why choose */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
        <div className="rounded-3xl border bg-card p-6 shadow-card sm:p-10">
          <p className="eyebrow text-accent">Why KBestoreTZ</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Built on trust, speed and accountability
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason) => (
              <div key={reason.title}>
                <span className="grid h-11 w-11 place-items-center rounded-xl ink-panel">
                  <reason.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{reason.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{reason.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-accent">Customer reviews</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Trusted across Tanzania</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {reviews.map((review) => (
              <figure key={review.name} className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < review.rating
                          ? "h-4 w-4 fill-warning text-warning"
                          : "h-4 w-4 text-muted-foreground/40"
                      }
                    />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed">"{review.text}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold">{review.name}</span>
                  <span className="block text-xs text-muted-foreground">{review.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="ink-panel relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Deals, drops and repair tips</h2>
              <p className="mt-3 max-w-md text-sm text-white/60">
                Join 9,000+ subscribers getting new arrivals, price drops and device care advice
                once a week. No spam.
              </p>
            </div>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("You're subscribed", { description: email });
                setEmail("");
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-white/15 bg-white/10 text-white placeholder:text-white/40"
              />
              <Button type="submit" size="lg" variant="secondary" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
