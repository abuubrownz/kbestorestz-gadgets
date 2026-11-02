import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import brandLogo from "@/assets/brand/kbestoretz-logo.png";

const STORAGE_KEY = "kbestoretz.welcome.v1";

/** Fired by the footer "About KBestoreTZ" link to re-open the welcome screen. */
export const WELCOME_EVENT = "kbestoretz:open-welcome";

const essentials = [
  {
    Icon: BadgeCheck,
    title: "Genuine devices, real warranties",
    body: "Serial-verified phones, laptops, tablets and accessories with warranty records kept in your account.",
  },
  {
    Icon: Wrench,
    title: "Certified repairs you can follow",
    body: "Book online, then track every stage — diagnosis, quotation, repair and testing — with one tracking number.",
  },
  {
    Icon: Truck,
    title: "Dar es Salaam delivery, countrywide support",
    body: "Next-day delivery in Dar, plus repair drop-off and collection in Arusha and Mwanza.",
  },
];

/**
 * One-time welcome screen explaining what KBestoreTZ does.
 * Shown once per browser, and reopenable from the footer "About KBestoreTZ" link.
 */
export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "seen";
    } catch {
      /* storage blocked — treat as a first visit */
    }
    if (!seen) setOpen(true);

    const reopen = () => setOpen(true);
    window.addEventListener(WELCOME_EVENT, reopen);
    return () => window.removeEventListener(WELCOME_EVENT, reopen);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "seen");
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-xl sm:rounded-3xl [&>button]:text-white/70 [&>button]:hover:text-white">
        <div className="ink-panel relative overflow-hidden px-6 pt-8 pb-7 text-center sm:px-8">
          <div className="rainbow-rule absolute inset-x-0 top-0 h-1" aria-hidden />
          <div className="absolute -top-16 -right-10 h-44 w-44 rounded-full bg-cat-phone/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-cat-laptop/20 blur-3xl" />
          <div className="relative">
            <img
              src={brandLogo}
              alt="KBestoreTZ — tech shopping"
              className="mx-auto w-40 sm:w-48"
            />
            <p className="eyebrow mt-5 text-white/60">Welcome to KBestoreTZ</p>
            <DialogTitle className="mt-2 font-display text-2xl font-bold text-white sm:text-[1.7rem]">
              Buy, repair and track your tech in one place
            </DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-sm text-sm text-white/65">
              A Tanzanian technology store and repair workshop: genuine hardware, certified
              technicians, and a dashboard that keeps every order and repair in view.
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <ul className="grid gap-4">
            {essentials.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="gap-2 sm:flex-1">
              <Link to="/products" onClick={() => handleOpenChange(false)}>
                Shop devices <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="sm:flex-1">
              <Link to="/repairs/book" onClick={() => handleOpenChange(false)}>
                Book a repair
              </Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <Link
              to="/repairs/track"
              onClick={() => handleOpenChange(false)}
              className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Already booked? Track your repair
            </Link>
            <span>We&apos;ll remember this on this device.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
