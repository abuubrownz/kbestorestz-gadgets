import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wrench,
  Smartphone,
  MessageSquare,
  ImagePlus,
  CalendarCheck,
  Ticket,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import { PublicShell } from "@/components/kb/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { repairServices, formatTZS } from "@/lib/data";

export const Route = createFileRoute("/repairs/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Repair services — KBestoreTZ" },
      {
        name: "description",
        content:
          "Book certified phone, laptop and tablet repairs in Tanzania with real-time tracking, genuine parts and a 90-day warranty.",
      },
      { property: "og:title", content: "Repair services — KBestoreTZ" },
      {
        property: "og:description",
        content:
          "Digitized repair workflow: book online, upload photos, get a tracking number and follow every stage.",
      },
    ],
  }),
  component: RepairsIndexPage,
});

const steps = [
  { icon: Smartphone, title: "Select device", detail: "Tell us the device type and model." },
  { icon: MessageSquare, title: "Describe problem", detail: "Pick the issue and add details." },
  { icon: ImagePlus, title: "Upload images", detail: "Attach photos of the damage." },
  { icon: CalendarCheck, title: "Choose appointment", detail: "Pick a branch, date and time slot." },
  { icon: Ticket, title: "Get tracking number", detail: "Follow every repair stage online." },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "90-day workmanship guarantee",
    detail: "Every repair is covered for 90 days against workmanship defects.",
  },
  {
    icon: BadgeCheck,
    title: "Genuine parts",
    detail: "OEM and manufacturer-approved parts sourced from vetted suppliers.",
  },
  {
    icon: Sparkles,
    title: "Free diagnosis",
    detail: "No-obligation diagnosis before you approve any quotation.",
  },
  {
    icon: Users,
    title: "Certified technicians",
    detail: "Trained, background-checked technicians for board and micro-soldering work.",
  },
];

const faqs = [
  {
    q: "How long does a typical repair take?",
    a: "Most phone repairs finish the same day; laptops typically take 24–72 hours depending on parts availability. You'll see an estimate at booking and live updates on your tracking page.",
  },
  {
    q: "Do I need to pay before diagnosis?",
    a: "No. Diagnosis is free. We only ask you to approve a quotation before any paid work begins.",
  },
  {
    q: "What if I don't approve the quotation?",
    a: "You can decline the quote at no charge and simply collect your device — diagnosis remains free.",
  },
  {
    q: "Can I track my repair without an account?",
    a: "Yes. Use your tracking number (e.g. KB-RP-48219) on the Track repair page to see live status, notes and parts used.",
  },
  {
    q: "Do you use genuine parts?",
    a: "We use OEM and manufacturer-approved parts, and we always disclose the part grade on your quotation.",
  },
];

function RepairsIndexPage() {
  return (
    <PublicShell>
      <section className="grid-noise border-b border-border/70 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="eyebrow text-white/50">Repair services</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            A fully digitized repair workflow, from booking to collection.
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Book online, upload photos of the damage, choose an appointment and follow your
            device through every stage with a single tracking number.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/repairs/book">
                Book a repair <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10">
              <Link to="/repairs/track">Track a repair</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-accent">Services</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              What we repair
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {repairServices.map((service) => (
            <Card key={service.title} className="flex flex-col gap-3 p-5 shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                <Wrench className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-semibold">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.detail}</p>
              <div className="mt-auto flex items-center justify-between pt-2 text-sm">
                <span className="font-semibold">From {formatTZS(service.from)}</span>
                <span className="text-muted-foreground">{service.turnaround}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="eyebrow text-accent">Process</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full ink-panel text-white">
                  <step.icon className="h-5 w-5" />
                </span>
                <p className="eyebrow text-muted-foreground">Step {index + 1}</p>
                <h3 className="font-display text-base font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-accent">Guarantees</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Why customers trust KBestoreTZ
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((item) => (
            <Card key={item.title} className="flex flex-col gap-3 p-5 shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-success/10 text-success">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <p className="eyebrow text-accent">FAQ</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-display text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="ink-panel">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to get your device fixed?
            </h2>
            <p className="mt-2 max-w-lg text-white/70">
              Book online in minutes and get a tracking number instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/repairs/book">Book a repair</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10">
              <Link to="/repairs/track">Track a repair</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
