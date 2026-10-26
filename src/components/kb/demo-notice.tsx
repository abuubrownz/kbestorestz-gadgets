import { TriangleAlert } from "lucide-react";

/** Front desk line shown in the footer of the live site. */
export const FRONT_DESK_PHONE = "+255 712 000 445";
const FRONT_DESK_TEL = "+255712000445";

/**
 * Site-wide notice while the store has no backend: orders and repair bookings
 * made on the site are not stored or processed. Remove (or flip `DEMO_MODE`)
 * once real order and booking handling is live.
 */
export const DEMO_MODE = true;

export function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div role="status" className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-950 sm:text-sm dark:text-amber-100">
      <span className="font-semibold">Tovuti iko katika majaribio.</span> Oda na miadi ya matengenezo
      hazihifadhiwi bado. Kuagiza au kuweka miadi, tupigie{" "}
      <a href={`tel:${FRONT_DESK_TEL}`} className="font-semibold underline underline-offset-2">
        {FRONT_DESK_PHONE}
      </a>
      . <span className="hidden sm:inline">/ This site is a preview: orders and repair bookings are not saved yet. Please call us.</span>
    </div>
  );
}

/** Shown on the confirmation screens so nobody leaves thinking a demo request was recorded. */
export function DemoConfirmNotice({ what }: { what: "order" | "booking" }) {
  if (!DEMO_MODE) return null;
  const sw = what === "order" ? "oda yako" : "miadi yako";
  const en = what === "order" ? "order" : "booking";
  return (
    <div className="flex w-full items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-left text-sm text-amber-950 dark:text-amber-100">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="space-y-1">
        <p className="font-semibold">Hii ni onyesho la majaribio; {sw} haijahifadhiwa.</p>
        <p>
          Tafadhali tupigie{" "}
          <a href={`tel:${FRONT_DESK_TEL}`} className="font-semibold underline underline-offset-2">
            {FRONT_DESK_PHONE}
          </a>{" "}
          ili kukamilisha.
        </p>
        <p className="text-xs opacity-80">
          This is a demo: your {en} was not saved. Please call us to complete it.
        </p>
      </div>
    </div>
  );
}
