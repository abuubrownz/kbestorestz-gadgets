import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type DashboardNavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function DashboardShell({
  title,
  subtitle,
  workspace,
  nav,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  workspace: string;
  nav: DashboardNavItem[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const navList = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: true }}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors",
            "hover:bg-white/10 hover:text-white data-[status=active]:bg-accent data-[status=active]:text-accent-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="ink-panel sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-5 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 font-display text-sm font-bold text-white">
            KB
          </span>
          <span className="font-display text-sm font-bold text-white">
            KBestore<span className="text-accent">TZ</span>
          </span>
        </Link>
        <p className="eyebrow mt-6 mb-3 text-white/40">{workspace}</p>
        {navList()}
        <Link
          to="/"
          className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to storefront
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 ink-panel border-white/10 p-5">
              <SheetTitle className="font-display text-white">{workspace}</SheetTitle>
              <div className="mt-6">{navList(() => setOpen(false))}</div>
            </SheetContent>
          </Sheet>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {actions}
            <Button variant="outline" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <span className="grid h-9 w-9 place-items-center rounded-full ink-panel text-xs font-semibold">
              KB
            </span>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}