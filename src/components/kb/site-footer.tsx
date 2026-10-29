import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { categories, locations } from "@/lib/data";
import { CONTACT_EMAIL, CONTACT_HOURS, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/contact";
import { themeFor } from "@/lib/storefront-theme";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="ink-panel mt-24">
      <div className="rainbow-rule h-1 w-full" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 font-display text-sm font-bold">
              KB
            </span>
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
              { Icon: Facebook, hover: "hover:bg-cat-phone" },
              { Icon: Instagram, hover: "hover:bg-cat-gaming" },
              { Icon: Twitter, hover: "hover:bg-cat-tablet" },
            ].map(({ Icon, hover }, i) => (
              <a
                key={i}
                href="#"
                aria-label="KBestoreTZ social profile"
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
              <li key={loc.city} className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cat-audio" />
                <span>
                  <span className="block font-medium text-white">{loc.city}</span>
                  {loc.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cat-home" />{" "}
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-white">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-cat-phone" /> {CONTACT_EMAIL}
            </li>
            <li className="text-white/50">{CONTACT_HOURS}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 KBestoreTZ. All rights reserved.</p>
          <p>Dar es Salaam · Arusha · Mwanza</p>
        </div>
      </div>
    </footer>
  );
}
