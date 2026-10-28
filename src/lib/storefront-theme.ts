import {
  Cpu,
  Gamepad2,
  Headphones,
  HousePlug,
  Laptop,
  Smartphone,
  Tablet,
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * Colour and icon for each product family, shared by the header, homepage and footer.
 * Class names are written out in full so Tailwind can see them at build time.
 */
export type FamilyTheme = {
  icon: ComponentType<{ className?: string }>;
  /** Soft tinted background + coloured icon, for icon wells and chips. */
  tint: string;
  /** Hover border/glow for cards. */
  hover: string;
  /** Solid colour bar. */
  bar: string;
  /** Solid fill with readable text, for rank badges and promo pills. */
  solid: string;
  /** Coloured text for links and small labels. */
  text: string;
};

export const familyTheme = {
  smartphones: {
    icon: Smartphone,
    tint: "bg-cat-phone/10 text-cat-phone",
    hover: "hover:border-cat-phone/60 hover:shadow-[0_18px_40px_-26px_var(--cat-phone)]",
    bar: "bg-cat-phone",
    solid: "bg-cat-phone text-white",
    text: "text-cat-phone",
  },
  laptops: {
    icon: Laptop,
    tint: "bg-cat-laptop/10 text-cat-laptop",
    hover: "hover:border-cat-laptop/60 hover:shadow-[0_18px_40px_-26px_var(--cat-laptop)]",
    bar: "bg-cat-laptop",
    solid: "bg-cat-laptop text-white",
    text: "text-cat-laptop",
  },
  tablets: {
    icon: Tablet,
    tint: "bg-cat-tablet/10 text-cat-tablet",
    hover: "hover:border-cat-tablet/60 hover:shadow-[0_18px_40px_-26px_var(--cat-tablet)]",
    bar: "bg-cat-tablet",
    solid: "bg-cat-tablet text-white",
    text: "text-cat-tablet",
  },
  accessories: {
    icon: Headphones,
    tint: "bg-cat-audio/10 text-cat-audio",
    hover: "hover:border-cat-audio/60 hover:shadow-[0_18px_40px_-26px_var(--cat-audio)]",
    bar: "bg-cat-audio",
    solid: "bg-cat-audio text-white",
    text: "text-cat-audio",
  },
  gaming: {
    icon: Gamepad2,
    tint: "bg-cat-gaming/10 text-cat-gaming",
    hover: "hover:border-cat-gaming/60 hover:shadow-[0_18px_40px_-26px_var(--cat-gaming)]",
    bar: "bg-cat-gaming",
    solid: "bg-cat-gaming text-white",
    text: "text-cat-gaming",
  },
  "smart-home": {
    icon: HousePlug,
    tint: "bg-cat-home/10 text-cat-home",
    hover: "hover:border-cat-home/60 hover:shadow-[0_18px_40px_-26px_var(--cat-home)]",
    bar: "bg-cat-home",
    solid: "bg-cat-home text-white",
    text: "text-cat-home",
  },
  "spare-parts": {
    icon: Cpu,
    tint: "bg-cat-parts/20 text-amber-700 dark:text-cat-parts",
    hover: "hover:border-cat-parts/70 hover:shadow-[0_18px_40px_-26px_var(--cat-parts)]",
    bar: "bg-cat-parts",
    solid: "bg-cat-parts text-neutral-900",
    text: "text-amber-700 dark:text-cat-parts",
  },
} satisfies Record<string, FamilyTheme>;

export type FamilySlug = keyof typeof familyTheme;

export function themeFor(slug: string): FamilyTheme {
  return (familyTheme as Record<string, FamilyTheme>)[slug] ?? familyTheme.smartphones;
}
