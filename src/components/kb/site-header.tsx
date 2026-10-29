import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck,
  User,
  Wrench,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { roleHome, roleLabels, useAuth } from "@/lib/auth";
import { categories } from "@/lib/data";
import { familyTheme, themeFor } from "@/lib/storefront-theme";
import { BrandLogo } from "@/components/kb/brand-logo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Store" },
  { to: "/repairs", label: "Repairs" },
  { to: "/repairs/track", label: "Track repair" },
  { to: "/account", label: "My account" },
] as const;

const PartsIcon = familyTheme["spare-parts"].icon;
const PHONE_LABEL = "+255 712 000 445";
const PHONE_TEL = "+255712000445";

function UtilityBar() {
  return (
    <div className="ink-panel text-xs text-white/80">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <ul className="hidden items-center gap-5 md:flex">
          <li className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-cat-audio" /> Next-day delivery in Dar es Salaam
          </li>
          <li className="hidden items-center gap-1.5 lg:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-cat-home" /> 90-day repair guarantee
          </li>
          <li className="hidden items-center gap-1.5 xl:flex">
            <BadgeCheck className="h-3.5 w-3.5 text-cat-phone" /> Genuine, serial-verified devices
          </li>
        </ul>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/repairs/track" className="hover:text-white">
            Track repair
          </Link>
          <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-1.5 hover:text-white">
            <Phone className="h-3.5 w-3.5" /> {PHONE_LABEL}
          </a>
        </div>
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  onSubmit,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} role="search" className={cn("relative", className)}>
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search phones, laptops, gaming, accessories…"
        className="h-11 w-full rounded-full border border-input bg-secondary/60 pr-14 pl-5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:bg-background focus:ring-2 focus:ring-accent/30"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent/90"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const { user, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Staff-only entry points: customers and signed-out visitors never see them.
  const staffLinks = [
    ...(hasRole("admin") ? [{ to: "/admin", label: "Admin dashboard" }] : []),
    ...(hasRole(["admin", "technician"]) ? [{ to: "/technician", label: "Technician dashboard" }] : []),
  ];

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    void navigate({ to: "/products", search: q ? { q } : {} });
  }

  const stripLink =
    "group flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

  return (
    <>
      <UtilityBar />
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="rainbow-rule h-0.5 w-full" aria-hidden />
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center" aria-label="kbestorestz home">
            <BrandLogo />
          </Link>

          <SearchBox
            value={query}
            onChange={setQuery}
            onSubmit={submitSearch}
            className="mx-2 hidden max-w-2xl flex-1 md:block"
          />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {user && hasRole(["admin", "technician"]) ? (
              <Link to={roleHome[user.role] as "/"} className="hidden xl:block" aria-label="Open dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : null}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-2 lg:inline-flex"
                onClick={signOut}
                title={`${user.name} · ${roleLabels[user.role]}`}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            ) : (
              <Link to="/login" search={{}} className="hidden lg:block">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            )}
            <Link to="/account" aria-label="My account" className="hidden sm:block">
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cart" aria-label="Open cart" className="relative">
              <Button variant="outline" size="icon">
                <ShoppingCart className="h-4 w-4" />
              </Button>
              {count > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-sale px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
            <Link to="/repairs/book" className="hidden sm:block">
              <Button className="gap-2 bg-accent text-accent-foreground shadow-glow hover:bg-accent/90">
                <Wrench className="h-4 w-4" />
                Book repair
              </Button>
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetTitle className="font-display">Menu</SheetTitle>
                <div className="mt-6 flex flex-col gap-1">
                  <p className="eyebrow px-3 pt-1 pb-2 text-muted-foreground">Shop by category</p>
                  {categories.map((cat) => {
                    const theme = themeFor(cat.slug);
                    return (
                      <Link
                        key={cat.slug}
                        to="/products"
                        search={{ category: cat.slug }}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                      >
                        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", theme.tint)}>
                          <theme.icon className="h-4 w-4" />
                        </span>
                        {cat.name}
                      </Link>
                    );
                  })}
                  <Link
                    to="/"
                    hash="spare-parts"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    <span className={cn("grid h-8 w-8 place-items-center rounded-lg", familyTheme["spare-parts"].tint)}>
                      <PartsIcon className="h-4 w-4" />
                    </span>
                    Spare parts
                  </Link>
                  <p className="eyebrow px-3 pt-4 pb-2 text-muted-foreground">More</p>
                  {[...nav, ...staffLinks].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Sign out ({roleLabels[user.role]})
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      search={{}}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Sign in
                    </Link>
                  )}
                  <Link to="/repairs/book" onClick={() => setOpen(false)} className="mt-3">
                    <Button className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                      <Wrench className="h-4 w-4" /> Book a repair
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search */}
        <div className="px-4 pb-3 md:hidden">
          <SearchBox value={query} onChange={setQuery} onSubmit={submitSearch} />
        </div>

        {/* Category strip */}
        <nav aria-label="Shop by category" className="border-t border-border/60">
          <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6">
            {categories.map((cat) => {
              const theme = themeFor(cat.slug);
              return (
                <li key={cat.slug} className="shrink-0">
                  <Link to="/products" search={{ category: cat.slug }} className={stripLink}>
                    <span className={cn("grid h-6 w-6 place-items-center rounded-md", theme.tint)}>
                      <theme.icon className="h-3.5 w-3.5" />
                    </span>
                    {cat.name}
                  </Link>
                </li>
              );
            })}
            <li className="shrink-0">
              <Link to="/" hash="spare-parts" className={stripLink}>
                <span className={cn("grid h-6 w-6 place-items-center rounded-md", familyTheme["spare-parts"].tint)}>
                  <PartsIcon className="h-3.5 w-3.5" />
                </span>
                Spare parts
              </Link>
            </li>
            <li className="shrink-0">
              <Link to="/repairs" className={stripLink}>
                <span className="grid h-6 w-6 place-items-center rounded-md bg-accent/10 text-accent">
                  <Wrench className="h-3.5 w-3.5" />
                </span>
                Repairs
              </Link>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
