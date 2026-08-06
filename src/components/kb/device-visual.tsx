import { cn } from "@/lib/utils";
import type { Product } from "@/lib/data";

/** Abstract premium device visual built from brand tokens (no stock photos). */
export function DeviceVisual({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(150deg, ${product.colorFrom}, ${product.colorTo})`,
      }}
    >
      <div className="absolute inset-0 grid-noise opacity-40" />
      <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3/4 w-1/3 min-w-16 rounded-xl border border-white/25 bg-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm" />
      </div>
      {product.badge ? (
        <span className="eyebrow absolute top-3 left-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] text-white backdrop-blur">
          {product.badge}
        </span>
      ) : null}
    </div>
  );
}