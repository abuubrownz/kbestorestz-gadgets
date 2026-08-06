import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { locations } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="ink-panel mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
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
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="KBestoreTZ social profile"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link to="/products" className="hover:text-accent">Technology store</Link></li>
            <li><Link to="/repairs" className="hover:text-accent">Device repair</Link></li>
            <li><Link to="/repairs/book" className="hover:text-accent">Book a repair</Link></li>
            <li><Link to="/repairs/track" className="hover:text-accent">Track a repair</Link></li>
            <li><Link to="/account" className="hover:text-accent">Warranty & loyalty</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-white/50">Locations</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {locations.map((loc) => (
              <li key={loc.city} className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
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
              <Phone className="h-4 w-4 text-accent" /> +255 712 000 445
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" /> support@kbestoretz.co.tz
            </li>
            <li className="text-white/50">Mon – Sat · 08:30 – 19:00 EAT</li>
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