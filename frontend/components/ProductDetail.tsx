"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import ComparisonTables from "@/components/ComparisonTables";
import { ImagePlaceholder, type Tone } from "@/components/ui/ImagePlaceholder";
import { StarIcon } from "@/components/ui/Icons";
import {
  addCartItem,
  createReview,
  getComparison,
  getOrders,
  getReviews,
  getStoredUser,
  markDelivered,
  placeOrder,
  submitVerification,
  type Comparison,
  type Order,
  type Review,
} from "@/lib/api";
import type { Product } from "@/types/product";

const CATEGORY_EMOJIS: Record<string, string> = {
  laptop: "💻", laptops: "💻", mobile: "📱", mobiles: "📱",
  earphone: "🎧", earphones: "🎧", headphones: "🎧", headphone: "🎧",
  gpu: "🖥️", monitor: "🖥️", keyboard: "⌨️", mouse: "🖱️",
  smartwatch: "⌚", camera: "📷", router: "📡", printer: "🖨️",
  television: "📺", tablet: "📱", storage: "💾", cpu: "🧠", speaker: "🔊",
};
const TONES: Tone[] = ["teal", "violet", "amber", "emerald", "sky", "rose", "orange", "fuchsia", "slate", "lime"];

export default function ProductDetail({ product }: { product: Product }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [matches, setMatches] = useState(true);
  const [message, setMessage] = useState("");
  const [isBuyer, setIsBuyer] = useState(false);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [cartAdded, setCartAdded] = useState(false);

  const emoji = CATEGORY_EMOJIS[product.category?.name?.toLowerCase().trim() ?? ""] ?? "📦";
  const tone = TONES[(product.id - 1) % TONES.length];

  async function loadBuyerData() {
    const user = getStoredUser();
    setIsBuyer(user?.role === "buyer");
    if (user?.role === "buyer") {
      setOrders(await getOrders().catch(() => []));
    } else setOrders([]);
  }

  useEffect(() => {
    queueMicrotask(async () => {
      setReviews(await getReviews(product.id).catch(() => []));
      setComparison(await getComparison(product.id).catch(() => null));
      await loadBuyerData();
    });
    window.addEventListener("auth-changed", loadBuyerData);
    return () => window.removeEventListener("auth-changed", loadBuyerData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  async function submitReviewForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setReviews([await createReview(product.id, { rating, body }), ...reviews]);
      setBody("");
      setMessage("Review submitted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit review.");
    }
  }

  async function buyProduct() {
    try {
      const order = await placeOrder(product.id);
      setOrders([order, ...orders]);
      setMessage("Order placed successfully!");
    } catch {
      setMessage("Sign in as a Buyer to buy this product.");
    }
  }

  async function handleAddToCart() {
    try {
      await addCartItem(product.id);
      setCartAdded(true);
      window.dispatchEvent(new Event("cart-changed"));
      setTimeout(() => setCartAdded(false), 2000);
    } catch {
      setMessage("Sign in as a Buyer to add to cart.");
    }
  }

  async function deliverOrder(order: Order) {
    try {
      const updated = await markDelivered(order.id);
      setOrders(orders.map((item) => (item.id === order.id ? updated : item)));
      setMessage("Order marked as delivered.");
    } catch {
      setMessage("Could not update delivery.");
    }
  }

  async function verifyOrder(event: FormEvent<HTMLFormElement>, order: Order) {
    event.preventDefault();
    try {
      await submitVerification(order.id, { matches_listing: matches, notes: notes || undefined });
      setOrders(orders.map((item) => (item.id === order.id ? { ...item } : item)));
      setNotes("");
      setMessage("Feature verification saved.");
    } catch {
      setMessage("Could not save verification.");
    }
  }

  const productOrder = orders.find((order) => order.product_id === product.id);
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-neutral-500">
        <Link href="/" className="hover:text-teal-700 hover:underline">Home</Link>
        <span className="mx-2">›</span>
        {product.category && (
          <>
            <Link href={`/?q=${encodeURIComponent(product.category.name)}`} className="hover:text-teal-700 hover:underline">
              {product.category.name}
            </Link>
            <span className="mx-2">›</span>
          </>
        )}
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      {/* Product hero */}
      <div className="grid gap-6 rounded-xl border border-neutral-300 bg-white p-5 sm:p-8 lg:grid-cols-[400px_1fr]">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-xl">
          <ImagePlaceholder
            emoji={emoji}
            tone={tone}
            label={product.name}
            className="h-full w-full"
            emojiClassName="text-[120px]"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{product.name}</h1>

          {product.brand && (
            <p className="mt-1 text-sm text-neutral-500">
              by <span className="text-teal-700">{product.brand}</span>
            </p>
          )}

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "text-amber-500" : "text-neutral-300"}`} />
                ))}
              </div>
              <span className="text-sm text-teal-700">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Discrepancy warning */}
          {comparison?.discrepancies.length ? (
            <div role="alert" className="mt-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-amber-800">
              <strong>⚠ Spec discrepancy detected:</strong> {comparison.discrepancies.slice(0, 3).join("; ")}
              {comparison.discrepancies.length > 3 ? " ..." : ""}
            </div>
          ) : null}

          <p className="mt-3 text-sm text-neutral-600">
            <strong>Category:</strong> {product.category?.name ?? "Uncategorized"}
          </p>

          {product.asin && (
            <p className="mt-1 text-sm text-neutral-500">ASIN: {product.asin}</p>
          )}

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-bold text-neutral-900 mb-2">Product Specifications</h2>
              <div className="rounded-lg border border-neutral-200 overflow-hidden">
                {product.specifications.map((spec, i) => (
                  <div key={spec.id} className={`flex text-sm ${i % 2 === 0 ? "bg-neutral-50" : "bg-white"}`}>
                    <span className="w-40 shrink-0 border-r border-neutral-200 px-3 py-2 font-medium text-neutral-700">
                      {spec.specification_name}
                    </span>
                    <span className="px-3 py-2 text-neutral-900">{spec.specification_value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-auto flex flex-wrap gap-3 pt-5">
            <button
              type="button"
              onClick={buyProduct}
              className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-white hover:bg-amber-400 transition-colors"
            >
              Buy now
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-lg bg-teal-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-teal-300 transition-colors"
            >
              {cartAdded ? "✓ Added to cart" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p role="status" className="mt-4 rounded-lg bg-white border border-neutral-300 px-4 py-3 text-sm text-neutral-700">
          {message}
        </p>
      )}

      {/* Comparison tables */}
      {comparison && (
        <div className="mt-6">
          <ComparisonTables comparison={comparison} />
        </div>
      )}

      {/* Order / Delivery / Verification */}
      {productOrder?.status === "placed" && (
        <section className="mt-6 rounded-xl border border-neutral-300 bg-white p-5">
          <h2 className="text-lg font-bold text-neutral-900 mb-2">Order Status</h2>
          <p className="text-sm text-neutral-600 mb-3">Order #{productOrder.id} is on its way.</p>
          <button
            type="button"
            onClick={() => deliverOrder(productOrder)}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Mark as delivered
          </button>
        </section>
      )}

      {productOrder?.status === "delivered" && (
        <section className="mt-6 rounded-xl border border-neutral-300 bg-white p-5">
          <h2 className="text-lg font-bold text-neutral-900 mb-3">Confirm Product Features</h2>
          <form onSubmit={(event) => verifyOrder(event, productOrder)} className="grid gap-3 max-w-md">
            <label className="grid gap-1 text-sm font-medium">
              Do the received features match the listing?
              <select
                value={String(matches)}
                onChange={(event) => setMatches(event.target.value === "true")}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="true">Yes, they match</option>
                <option value="false">No, they do not match</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={3}
              />
            </label>
            <button type="submit" className="w-fit rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Save confirmation
            </button>
          </form>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-6 rounded-xl border border-neutral-300 bg-white p-5">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Customer Reviews</h2>

        {isBuyer && (
          <form onSubmit={submitReviewForm} className="mb-6 grid gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 max-w-md">
            <h3 className="text-sm font-bold">Write a review</h3>
            <label className="grid gap-1 text-sm font-medium">
              Rating
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value} / 5</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Review
              <textarea
                required
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={3}
              />
            </label>
            <button type="submit" className="w-fit rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
              Post review
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <article key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                <div className="flex text-amber-500 mb-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? "text-amber-500" : "text-neutral-300"}`} />
                  ))}
                </div>
                <p className="text-sm text-neutral-800">{review.body}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}