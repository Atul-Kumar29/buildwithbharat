import Link from "next/link";
import { ImagePlaceholder, type Tone } from "@/components/ui/ImagePlaceholder";
import type { Product } from "@/types/product";

const CATEGORY_EMOJIS: Record<string, string> = {
  laptop: "💻", laptops: "💻",
  mobile: "📱", mobiles: "📱", phone: "📱", smartphone: "📱",
  earphone: "🎧", earphones: "🎧", headphones: "🎧", headphone: "🎧",
  gpu: "🖥️", monitor: "🖥️", keyboard: "⌨️", mouse: "🖱️",
  smartwatch: "⌚", camera: "📷", router: "📡", printer: "🖨️",
  television: "📺", tv: "📺", tablet: "📱", storage: "💾", cpu: "🧠",
  speaker: "🔊",
};

const TONES: Tone[] = ["teal", "violet", "amber", "emerald", "sky", "rose", "orange", "fuchsia", "slate", "lime"];

function getEmoji(product: Product): string {
  const catName = product.category?.name?.toLowerCase().trim() ?? "";
  return CATEGORY_EMOJIS[catName] ?? "📦";
}

interface Props {
  product: Product;
  rank?: number;
  className?: string;
}

/**
 * Compact product card for horizontal rails.
 * Shows REAL backend data: name, brand, category, and spec count.
 */
export function ProductTile({ product, rank, className = "" }: Props) {
  const tone = TONES[(product.id - 1) % TONES.length];

  return (
    <Link href={`/product/${product.id}`} className={`group flex flex-col ${className}`}>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
        <ImagePlaceholder
          emoji={getEmoji(product)}
          tone={tone}
          label={product.name}
          className="h-full w-full transition-transform duration-200 group-hover:scale-105"
          emojiClassName="text-7xl"
        />
        {rank !== undefined && (
          <span className="absolute left-0 top-0 rounded-br-md bg-slate-800 px-2 py-1 text-xs font-bold text-white">
            #{rank}
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 h-10 text-[13px] leading-5 text-neutral-900 group-hover:text-teal-700">
        {product.name}
      </h3>

      {product.brand && (
        <p className="mt-0.5 text-xs text-neutral-500">{product.brand}</p>
      )}

      <p className="mt-0.5 text-xs text-neutral-600">
        {product.category?.name ?? "Uncategorized"}
        {product.specifications.length > 0 && (
          <> · <span className="text-teal-700 group-hover:underline">{product.specifications.length} specs</span></>
        )}
      </p>
    </Link>
  );
}
