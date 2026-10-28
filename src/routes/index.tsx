import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  Cpu,
  Flame,
  Laptop,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicShell } from "@/components/kb/public-shell";
import { ProductCard } from "@/components/kb/product-card";
import { DeviceVisual } from "@/components/kb/device-visual";
import heroDevices from "@/assets/hero-devices.jpg";
import { categories, formatTZS, products, repairServices, reviews } from "@/lib/data";
import { themeFor } from "@/lib/storefront-theme";
import { CONTACT_PHONE_TEL } from "@/lib/contact";
import { cn } from "@/lib/utils";

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

const reasons = [
  {
    family: "smartphones",
    icon: BadgeCheck,
    title: "Genuine products",
    body: "Every device is sourced through authorised distributors and serial-verified before it ships.",
  },
  {
    family: "laptops",
    icon: Wrench,
    title: "Expert technicians",
    body: "Board-level certified engineers with a 90-day workmanship guarantee on all repairs.",
  },
  {
    family: "smart-home",
    icon: ShieldCheck,
    title: "Warranty support",
    body: "Warranty and service history stay on your account — no receipts to keep, no queues.",
  },
  {
    family: "accessories",
    icon: Timer,
    title: "Fast service",
    body: "Same-day screen and battery repairs, next-day delivery in Dar es Salaam.",
  },
] as const;

const repairLook: Record<string, { family: string; icon: React.ComponentType<{ className?: string }> }> = {
  "Phone repair": { family: "smartphones", icon: Smartphone },
  "Laptop repair": { family: "laptops", icon: Laptop },
  "Software installation": { family: "smart-home", icon: Cpu },
  "Screen replacement": { family: "gaming", icon: Smartphone },
  "Battery replacement": { family: "accessories", icon: BatteryCharging },
};

const partsShowcase = [
  {
    brand: "iPhone",
    family: "smartphones",
    icon: Smartphone,
    note: "iPhone 8 through the latest Pro Max",
    parts: ["Screens", "Batteries", "Charging ports", "Cameras"],
  },
  {
    brand: "Samsung",
    family: "tablets",
    icon: Smartphone,
    note: "Galaxy S, A, Note and Tab series",
    parts: ["Screens", "Batteries", "Charging ports", "Back glass"],
  },
  {
    brand: "Laptops",
    family: "laptops",
    icon: Laptop,
    note: "Dell, HP, Lenovo, MacBook and more",
    parts: ["Screens", "Batteries", "Keyboards", "Chargers", "Hinges"],
  },
  {
    brand: "Other Android",
    family: "smart-home",
    icon: Smartphone,
    note: "Tecno, Infinix, Xiaomi and more",
    parts: ["Screens", "Batteries", "Charging ports", "Speakers"],
  },
] as const;

const savePercent = (price: number, compareAt: number) => Math.round((1 - price / compareAt) * 100);

function Home() {
  const [email, setEmail] = useState("");
  const featured = products.slice(0, 8);
  const deals = products
    .filter((p) => typeof p.compareAt === "number" && p.compareAt > p.price)
    .sort(
      (a, b) =>
        savePercent(b.price, b.compareAt as number) - savePercent(a.price, a.compareAt as number),
    );
  const favourites = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 6);

  return (
    <PublicShell>
      {/* Hero */}
      <section className="ink-panel relative overflow-hidden">
        <div className="absolute inset-0 grid-noise opacity-30" />
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cat-phone/30 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-cat-laptop/25 blur-3xl" />
        <div className="absolute top-10 right-1/3 h-48 w-48 rounded-full bg-cat-gaming/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-2 lg:pt-20 lg:pb-28">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/70">
              <Zap className="h-3.5 w-3.5 text-cat-audio" /> East Africa technology ecosystem
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Your complete
              <br />
              <span className="bg-linear-to-r from-cat-phone via-cat-laptop to-cat-gaming bg-clip-text text-transparent">
                technology partner
              </span>
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
                { k: "12,400+", v: "Devices delivered", c: "text-cat-phone" },
                { k: "3,900+", v: "Repairs completed", c: "text-cat-home" },
                { k: "4.9/5", v: "Customer rating", c: "text-cat-parts" },
              ].map((stat) => (
                <div key={stat.v}>
                  <dt className={cn("font-display text-2xl font-bold", stat.c)}>{stat.k}</dt>
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
                <div className="h-full w-4/5 rounded-full bg-cat-home" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo trio, overlapping the hero */}
      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/repairs/book"
            className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-cat-phone to-cat-laptop p-6 text-white shadow-lift transition-transform hover:-translate-y-0.5"
          >
            <Wrench className="absolute -right-4 -bottom-4 h-28 w-28 text-white/15" />
            <p className="eyebrow text-white/75">Repairs</p>
            <h2 className="mt-2 text-xl font-bold">Certified repairs, tracked live</h2>
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Book online, then follow every stage with your tracking number.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-900">
              Book repair <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <a
            href="#deals"
            className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-cat-gaming to-cat-audio p-6 text-white shadow-lift transition-transform hover:-translate-y-0.5"
          >
            <Flame className="absolute -right-4 -bottom-4 h-28 w-28 text-white/15" />
            <p className="eyebrow text-white/80">Deals</p>
            <h2 className="mt-2 text-xl font-bold">Deals of the week</h2>
            <p className="mt-2 max-w-xs text-sm text-white/85">
              Flagship phones, laptops and audio with the price drop shown up front.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-900">
              See the deals <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
          <a
            href="#spare-parts"
            className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-cat-parts to-cat-audio p-6 text-neutral-900 shadow-lift transition-transform hover:-translate-y-0.5"
          >
            <Cpu className="absolute -right-4 -bottom-4 h-28 w-28 text-black/10" />
            <p className="eyebrow text-neutral-800/75">Spare parts</p>
            <h2 className="mt-2 text-xl font-bold">Parts for iPhone, Samsung &amp; laptops</h2>
            <p className="mt-2 max-w-xs text-sm text-neutral-800/85">
              Screens, batteries, keyboards and more, with prices confirmed on request.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-sm font-semibold text-white">
              Browse parts <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        </div>
      </section>

      {/* Trending chips */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-sale" />
          <h2 className="text-base font-bold">Trending now</h2>
        </div>
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const theme = themeFor(cat.slug);
            return (
              <li key={cat.slug} className="shrink-0">
                <Link
                  to="/products"
                  search={{ category: cat.slug }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary",
                    theme.hover,
                  )}
                >
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full", theme.tint)}>
                    <theme.icon className="h-3.5 w-3.5" />
                  </span>
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
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
            const theme = themeFor(cat.slug);
            return (
              <Link
                key={cat.slug}
                to="/products"
                search={{ category: cat.slug }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5",
                  theme.hover,
                )}
              >
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", theme.bar)} />
                <span className={cn("grid h-12 w-12 place-items-center rounded-xl", theme.tint)}>
                  <theme.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{cat.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cat.blurb}</p>
                <p className={cn("mt-3 text-xs font-medium", theme.text)}>{cat.items} products →</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Deals of the week */}
      {deals.length > 0 ? (
        <section id="deals" className="scroll-mt-44 bg-surface py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow flex items-center gap-1.5 text-sale">
                  <Flame className="h-3.5 w-3.5" /> Price drops
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Deals of the week</h2>
              </div>
              <Link to="/products" className="text-sm font-medium text-accent hover:underline">
                View all products →
              </Link>
            </div>
            <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
              {deals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="w-64 shrink-0 snap-start sm:w-72"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Customer favourites, ranked */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <p className="eyebrow flex items-center gap-1.5 text-cat-laptop">
          <Sparkles className="h-3.5 w-3.5" /> Most reviewed
        </p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Customer favourites</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map((product, i) => {
            const theme = themeFor(product.category);
            return (
              <li key={product.id}>
                <Link
                  to="/products/$productId"
                  params={{ productId: product.id }}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5",
                    theme.hover,
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-lg font-bold",
                      theme.solid,
                    )}
                  >
                    {i + 1}
                  </span>
                  <DeviceVisual product={product} className="h-16 w-16 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug">
                      {product.name}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {product.rating} ({product.reviews})
                    </span>
                    <span className="mt-0.5 block font-display text-sm font-bold">
                      {formatTZS(product.price)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Spare parts showcase */}
      <section id="spare-parts" className="scroll-mt-44 bg-surface py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow flex items-center gap-1.5 text-amber-700 dark:text-cat-parts">
                <Cpu className="h-3.5 w-3.5" /> Spare parts
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Original and OEM-grade spare parts
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
                Tell us your model and the part you need. Availability and price are confirmed by
                our front desk before you pay.
              </p>
            </div>
            <a href={`tel:${CONTACT_PHONE_TEL}`}>
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <PhoneCall className="h-4 w-4" /> Call for a quote
              </Button>
            </a>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partsShowcase.map((tile) => {
              const theme = themeFor(tile.family);
              return (
                <div
                  key={tile.brand}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5",
                    theme.hover,
                  )}
                >
                  <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", theme.bar)} />
                  <span className={cn("grid h-12 w-12 place-items-center rounded-xl", theme.tint)}>
                    <tile.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{tile.brand}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{tile.note}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {tile.parts.map((part) => (
                      <li
                        key={part}
                        className={cn("rounded-full px-2.5 py-1 text-xs font-medium", theme.tint)}
                      >
                        {part}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs font-medium text-muted-foreground">Price on request</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Repair services */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
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
                <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Wrench className="h-4 w-4" /> Book repair now
                </Button>
              </Link>
              <Link to="/repairs/track">
                <Button variant="outline">Track a repair</Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {repairServices.map((service) => {
              const look = repairLook[service.title] ?? { family: "smartphones", icon: Wrench };
              const theme = themeFor(look.family);
              return (
                <div
                  key={service.title}
                  className={cn(
                    "rounded-2xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5",
                    theme.hover,
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("grid h-10 w-10 place-items-center rounded-xl", theme.tint)}>
                      <look.icon className="h-5 w-5" />
                    </span>
                    <span className={cn("eyebrow rounded-full px-2 py-1", theme.tint)}>
                      {service.turnaround}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{service.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{service.detail}</p>
                  <p className={cn("mt-3 text-sm font-semibold", theme.text)}>
                    From {formatTZS(service.from)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-surface py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
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
        </div>
      </section>

      {/* Why choose */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="rounded-3xl border bg-card p-6 shadow-card sm:p-10">
          <p className="eyebrow text-accent">Why KBestoreTZ</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Built on trust, speed and accountability
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason) => {
              const theme = themeFor(reason.family);
              return (
                <div key={reason.title}>
                  <span className={cn("grid h-12 w-12 place-items-center rounded-xl", theme.tint)}>
                    <reason.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{reason.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{reason.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-surface py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow text-accent">Customer reviews</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Trusted across Tanzania</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {reviews.map((review, i) => {
              const bars = ["bg-cat-phone", "bg-cat-laptop", "bg-cat-home"] as const;
              return (
                <figure
                  key={review.name}
                  className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-card"
                >
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-0 left-0 w-1", bars[i % bars.length])}
                  />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={
                          s < review.rating
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="ink-panel relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-cat-phone/30 blur-3xl" />
          <div className="absolute -top-16 left-1/3 h-52 w-52 rounded-full bg-cat-gaming/20 blur-3xl" />
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
