import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/Icons";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StarburstBadge } from "@/components/ui/StarburstBadge";
import type { CategoryCardData } from "@/lib/demo-data";
import type { Category } from "@/types/product";

/* ---------- Promo-based category card (from demo data) ---------- */

export function PromoCategoryCard({ card }: { card: CategoryCardData }) {
  return (
    <article className="flex flex-col rounded-xl border border-neutral-300 bg-white p-4 sm:p-5">
      <Link href={card.href} className="group mb-3 flex items-start justify-between gap-3">
        <h2 className="line-clamp-2 min-h-12 text-xl font-bold leading-6 text-neutral-900 group-hover:text-teal-700">
          {card.title}
        </h2>
        <ChevronRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-neutral-700 group-hover:text-teal-700" />
      </Link>

      <ul className="grid flex-1 grid-cols-2 content-start gap-x-3 gap-y-4">
        {card.tiles.map((tile) => (
          <li key={tile.label}>
            <Link href={tile.href} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <ImagePlaceholder
                  emoji={tile.emoji}
                  tone={tile.tone}
                  label={tile.label}
                  className="h-full w-full transition-transform duration-200 group-hover:scale-105"
                />
                {tile.badge && (
                  <StarburstBadge
                    top={tile.badge.top}
                    value={tile.badge.value}
                    className="absolute bottom-1.5 right-1.5"
                  />
                )}
              </div>
              <p className="mt-1.5 truncate text-[13px] leading-5 text-neutral-800 group-hover:text-teal-700">
                {tile.label}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Grid of promo category cards */
export function PromoCategoryGrid({ cards }: { cards: CategoryCardData[] }) {
  return (
    <section className="grid grid-cols-1 gap-x-2.5 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <PromoCategoryCard key={c.id} card={c} />
      ))}
    </section>
  );
}

/* ---------- Real category card (from backend) ---------- */

const CATEGORY_EMOJIS: Record<string, string> = {
  laptop: "💻", laptops: "💻",
  mobile: "📱", mobiles: "📱", phone: "📱", smartphone: "📱",
  earphone: "🎧", earphones: "🎧", headphones: "🎧", headphone: "🎧",
  gpu: "🖥️", "graphics card": "🖥️",
  monitor: "🖥️", monitors: "🖥️",
  keyboard: "⌨️", keyboards: "⌨️",
  mouse: "🖱️", mice: "🖱️",
  smartwatch: "⌚", smartwatches: "⌚",
  camera: "📷", cameras: "📷",
  router: "📡", routers: "📡",
  printer: "🖨️", printers: "🖨️",
  television: "📺", tv: "📺", "smart tv": "📺",
  tablet: "📱", tablets: "📱",
  storage: "💾",
  cpu: "🧠",
  speaker: "🔊", speakers: "🔊",
};

const CATEGORY_TONES: Array<import("@/components/ui/ImagePlaceholder").Tone> = [
  "teal", "violet", "amber", "emerald", "sky", "rose", "orange", "fuchsia", "slate", "lime",
];

function getEmoji(name: string): string {
  return CATEGORY_EMOJIS[name.toLowerCase().trim()] ?? "📦";
}

export function RealCategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-neutral-900">Shop by category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/?q=${encodeURIComponent(cat.name)}`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-neutral-300 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="aspect-square w-full overflow-hidden rounded-lg">
              <ImagePlaceholder
                emoji={getEmoji(cat.name)}
                tone={CATEGORY_TONES[i % CATEGORY_TONES.length]}
                label={cat.name}
                className="h-full w-full transition-transform duration-200 group-hover:scale-105"
                emojiClassName="text-5xl"
              />
            </div>
            <span className="text-sm font-medium text-neutral-800 group-hover:text-teal-700">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
