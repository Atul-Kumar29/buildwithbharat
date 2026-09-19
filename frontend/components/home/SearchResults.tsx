"use client";

import Link from "next/link";
import { ImagePlaceholder, type Tone } from "@/components/ui/ImagePlaceholder";
import { addCartItem, getStoredUser } from "@/lib/api";
import type { Product, Category } from "@/types/product";
import { useState } from "react";

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

function SearchProductCard({ product }: { product: Product }) {
  const tone = TONES[(product.id - 1) % TONES.length];
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    const user = getStoredUser();
    if (user?.role !== "buyer") return;
    try {
      await addCartItem(product.id);
      setAdded(true);
      window.dispatchEvent(new Event("cart-changed"));
      setTimeout(() => setAdded(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <article className="flex gap-4 rounded-xl border border-neutral-300 bg-white p-4 transition-shadow hover:shadow-md sm:p-5">
      <Link href={`/product/${product.id}`} className="shrink-0">
        <div className="h-40 w-40 overflow-hidden rounded-lg sm:h-48 sm:w-48">
          <ImagePlaceholder
            emoji={getEmoji(product)}
            tone={tone}
            label={product.name}
            className="h-full w-full"
            emojiClassName="text-6xl"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/product/${product.id}`} className="group">
          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-teal-700 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-neutral-500">by {product.brand}</p>
        )}

        <p className="mt-1 text-sm text-neutral-600">
          {product.category?.name ?? "Uncategorized"}
        </p>

        {product.specifications.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.specifications.slice(0, 4).map((spec) => (
              <span key={spec.id} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700">
                {spec.specification_name}: {spec.specification_value}
              </span>
            ))}
            {product.specifications.length > 4 && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-500">
                +{product.specifications.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 pt-3">
          <Link
            href={`/product/${product.id}`}
            className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {added ? "✓ Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function SearchResults({
  products,
  query,
  categories,
}: {
  products: Product[];
  query: string;
  categories: Category[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Sidebar filters */}
      <aside className="hidden lg:block">
        <div className="rounded-xl border border-neutral-300 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-neutral-900">Category</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/?q=${encodeURIComponent(cat.name)}`}
                  className="text-sm text-neutral-600 hover:text-teal-700 hover:underline"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-lg font-bold text-neutral-900">
            {products.length === 0
              ? `No results for "${query}"`
              : `Results for "${query}"`}
          </h1>
          <span className="text-sm text-neutral-500">{products.length} product{products.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="grid gap-4">
          {products.map((product) => (
            <SearchProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
