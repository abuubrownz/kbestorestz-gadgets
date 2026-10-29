import markSrc from "@/assets/kbestorestz-mark.png";
import { cn } from "@/lib/utils";

/**
 * KBestoreTZ brand logo. The mark is the shopping bag and devices on a black tile, so it reads
 * the same on light and dark pages. The wordmark is live text: white/black "kbestores" plus the
 * brand-yellow "tz".
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={markSrc}
      alt=""
      width={256}
      height={256}
      className={cn("h-9 w-9 shrink-0 rounded-lg bg-black object-cover", className)}
    />
  );
}

export function BrandLogo({
  tone = "auto",
  className,
  markClassName,
  textClassName,
}: {
  /** "dark" = for dark backgrounds (white text); "auto" = follows the page foreground colour. */
  tone?: "auto" | "dark";
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandMark className={markClassName} />
      <span
        className={cn(
          "font-display text-base font-bold tracking-tight",
          tone === "dark" ? "text-white" : "text-foreground",
          textClassName,
        )}
      >
        kbestores<span className="text-amber-400">tz</span>
      </span>
    </span>
  );
}
