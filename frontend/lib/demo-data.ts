/**
 * Local demo data — no backend API exists for these sections.
 *
 * This file provides hero carousel promos and promotional category card data
 * for the homepage UI. These are visual-only and do NOT represent real backend data.
 * When backend APIs for promotions/deals are added, replace this with real API calls.
 */

import type { Tone } from "@/components/ui/ImagePlaceholder";

/* ---------- Hero Promo Cards ---------- */

export interface Offer {
  headline: string;
  sub: string;
}

export interface FeaturePromo {
  kind: "feature";
  id: string;
  href: string;
  headline: string;
  subhead: string;
  chips: [string, string];
  emoji: string;
  from: string;
  to: string;
  theme: "light" | "dark";
  offer: Offer;
}

export interface GridPromo {
  kind: "grid";
  id: string;
  href: string;
  headline: string;
  from: string;
  to: string;
  theme: "light" | "dark";
  items: { label: string; emoji: string; tone: Tone; discount: string }[];
}

export type PromoCard = FeaturePromo | GridPromo;

export const HERO_PROMOS: PromoCard[] = [
  {
    kind: "feature",
    id: "electronics",
    href: "/",
    headline: "Verified Specs",
    subhead: "Electronics & more",
    chips: ["Spec comparison", "Trusted sellers"],
    emoji: "📱",
    from: "#0f766e",
    to: "#134e4a",
    theme: "dark",
    offer: { headline: "Compare before you buy", sub: "Verify product specs across sellers" },
  },
  {
    kind: "feature",
    id: "laptops",
    href: "/",
    headline: "Top Laptops",
    subhead: "Compare specs",
    chips: ["Top brands", "Best deals"],
    emoji: "💻",
    from: "#1d4ed8",
    to: "#1e3a8a",
    theme: "dark",
    offer: { headline: "Side-by-side comparison", sub: "CPU, RAM, Storage & more" },
  },
  {
    kind: "grid",
    id: "popular",
    href: "/",
    headline: "Shop popular categories",
    from: "#be123c",
    to: "#9f1239",
    theme: "dark",
    items: [
      { label: "Earphones", emoji: "🎧", tone: "violet", discount: "Compare" },
      { label: "Mobiles", emoji: "📱", tone: "emerald", discount: "Compare" },
      { label: "Keyboards", emoji: "⌨️", tone: "rose", discount: "Compare" },
      { label: "Monitors", emoji: "🖥️", tone: "sky", discount: "Compare" },
    ],
  },
  {
    kind: "feature",
    id: "headphones",
    href: "/",
    headline: "Earbuds & TWS",
    subhead: "Top picks",
    chips: ["Top brands", "Verified specs"],
    emoji: "🎧",
    from: "#eaf0f7",
    to: "#d3deeb",
    theme: "light",
    offer: { headline: "ANC, Battery life & more", sub: "Spec verification across sellers" },
  },
  {
    kind: "feature",
    id: "cameras",
    href: "/",
    headline: "Cameras",
    subhead: "Compare lenses",
    chips: ["DSLR", "Mirrorless"],
    emoji: "📷",
    from: "#f4ece3",
    to: "#e4d0ba",
    theme: "light",
    offer: { headline: "Sensor, ISO & more", sub: "Full spec comparison" },
  },
];

/* ---------- Promotional category tiles ---------- */

export interface TileBadge {
  top: string;
  value: string;
}

export interface Tile {
  label: string;
  href: string;
  emoji: string;
  tone: Tone;
  badge?: TileBadge;
}

export interface CategoryCardData {
  id: string;
  title: string;
  href: string;
  tiles: Tile[];
}

const t = (label: string, emoji: string, tone: Tone, badge?: TileBadge): Tile => ({
  label,
  emoji,
  tone,
  badge,
  href: "/",
});

export const PROMO_CATEGORY_CARDS: CategoryCardData[] = [
  {
    id: "mobile-acc",
    title: "Mobile accessories | Compare specs",
    href: "/",
    tiles: [
      t("Earbuds", "🎧", "slate"),
      t("Phone cases", "📱", "sky"),
      t("Power banks", "🔋", "emerald"),
      t("Screen guards", "🛡️", "fuchsia"),
    ],
  },
  {
    id: "computing",
    title: "Computing | Spec comparison",
    href: "/",
    tiles: [
      t("Laptops", "💻", "violet"),
      t("Keyboards", "⌨️", "amber"),
      t("Mice", "🖱️", "teal"),
      t("Monitors", "🖥️", "orange"),
    ],
  },
  {
    id: "audio",
    title: "Audio | Verified reviews",
    href: "/",
    tiles: [
      t("TWS Earbuds", "🎧", "emerald"),
      t("Neckbands", "🎵", "sky"),
      t("Headphones", "🎧", "violet"),
      t("Speakers", "🔊", "rose"),
    ],
  },
  {
    id: "smart-devices",
    title: "Smart devices | Starting specs",
    href: "/",
    tiles: [
      t("Smartwatches", "⌚", "fuchsia", { top: "Compare", value: "specs" }),
      t("Smart TVs", "📺", "orange"),
      t("Routers", "📡", "teal"),
      t("Cameras", "📷", "slate"),
    ],
  },
];
