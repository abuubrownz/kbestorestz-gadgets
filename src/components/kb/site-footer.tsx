import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import brandMark from "@/assets/brand/kbestoretz-mark.png";
import { categories, locations } from "@/lib/data";
import { themeFor } from "@/lib/storefront-theme";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP,
  mapsUrl,
} from "@/lib/contact";
import { WELCOME_EVENT } from "./welcome-dialog";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="ink-panel mt-24">
      <div className="rainbow-rule h-1 w-full" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <img src={brandMark} alt="" className="h-9 w-auto" />
            <span className="font-display text-base font-bold">
              KBestore<span className="text-accent">TZ</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/60">
            East Africa's trusted technology destination — buy, repair, upgrade and manage every
            device from one platform.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              {
                href: `https://wa.me/${CONTACT_WHATSAPP}`,
                label: "Chat with KBestoreTZ on WhatsApp",
                Icon: MessageCircle,
                hover: "hover:bg-success",
                external: true,
              },
              {
                href: `mailto:${CONTACT_EMAIL}`,
                label: "Email KBestoreTZ support",
                Icon: Mail,
                hover: "hover:bg-cat-phone",
                external: false,
              },
              {
                href: mapsUrl("KBestoreTZ Samora Ave Dar es Salaam"),
                label: "Find the Dar es Salaam store on Google Maps",
                Icon: MapPin,
                hover: "hover:bg-cat-laptop",
                external: true,
              },
            ].map(({ href, label, Icon, hover, external }) => (
              <a
                key={href}
                href={href}
                aria-label={label}
                title={label}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:text-white",
                  hover,
                )}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            {categories.map((cat) => {
              const theme = themeFor(cat.slug);
              return (
                <li key={cat.slug}>
                  <Link
                    to="/products"
                    search={{ category: cat.slug }}
                    className="group flex items-center gap-2 hover:text-white"
                  >
                    <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", theme.bar)} />
                    {cat.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link to="/" hash="spare-parts" className="flex items-center gap-2 hover:text-white">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-cat-parts" />
                Spare parts
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">Repairs &amp; support</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link to="/repairs" className="hover:text-white">Device repair</Link></li>
            <li><Link to="/repairs/book" className="hover:text-white">Book a repair</Link></li>
            <li><Link to="/repairs/track" className="hover:text-white">Track a repair</Link></li>
            <li><Link to="/account" className="hover:text-white">Orders, warranty &amp; loyalty</Link></li>
            <li><Link to="/cart" className="hover:text-white">Your cart</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">Locations</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {locations.map((loc) => (
              <li key={loc.city}>
                <a
                  href={mapsUrl(`KBestoreTZ ${loc.city} Tanzania`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-2 hover:text-white"
                  title={`Open ${loc.city} in Google Maps`}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cat-audio" />
                  <span>
                    <span className="block font-medium text-white">{loc.city}</span>
                    {loc.detail}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cat-home" />
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:underline">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-cat-phone" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-cat-gaming" />
              <a
                href={`https://wa.me/${CONTACT_WHATSAPP}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                WhatsApp us
              </a>
            </li>
            <li className="text-white/50">Mon – Sat · 08:30 – 19:00 EAT</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 KBestoreTZ. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(WELCOME_EVENT))}
              className="hover:text-white"
            >
              About KBestoreTZ
            </button>
            <span>Dar es Salaam · Arusha · Mwanza</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
