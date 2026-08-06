import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, Wrench, LayoutDashboard, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Store" },
  { to: "/repairs", label: "Repairs" },
  { to: "/repairs/track", label: "Track repair" },
  { to: "/account", label: "My account" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg ink-panel font-display text-sm font-bold">
            KB
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            KBestore<span className="text-accent">TZ</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/products"
            className="hidden h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground sm:grid"
            aria-label="Search products"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/admin"
            className="hidden md:block"
            aria-label="Open dashboards"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboards
            </Button>
          </Link>
          <Link to="/cart" aria-label="Open cart" className="relative">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            {count > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {count}
              </span>
            ) : null}
          </Link>
          <Link to="/repairs/book" className="hidden sm:block">
            <Button className="gap-2">
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
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display">Menu</SheetTitle>
              <div className="mt-6 flex flex-col gap-1">
                {[...nav, { to: "/admin", label: "Admin dashboard" }, { to: "/technician", label: "Technician dashboard" }].map(
                  (item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <Link to="/repairs/book" onClick={() => setOpen(false)} className="mt-3">
                  <Button className="w-full gap-2">
                    <Wrench className="h-4 w-4" /> Book a repair
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}