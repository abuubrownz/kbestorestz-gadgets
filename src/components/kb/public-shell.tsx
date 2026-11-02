import type { ReactNode } from "react";
import { DemoBanner } from "./demo-notice";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { WelcomeDialog } from "./welcome-dialog";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WelcomeDialog />
    </div>
  );
}