"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartIcon } from "@/components/ui/Icons";
import { ImagePlaceholder, type Tone } from "@/components/ui/ImagePlaceholder";
import {
  getCart,
  getStoredUser,
  removeCartItem,
  updateCartItem,
  type CartItem,
} from "@/lib/api";

const CATEGORY_EMOJIS: Record<string, string> = {
  laptop: "💻", laptops: "💻", mobile: "📱", mobiles: "📱",
  earphone: "🎧", earphones: "🎧", headphones: "🎧", headphone: "🎧",
  gpu: "🖥️", monitor: "🖥️", keyboard: "⌨️", mouse: "🖱️",
  smartwatch: "⌚", camera: "📷", router: "📡", printer: "🖨️",
  television: "📺", tablet: "📱", storage: "💾", cpu: "🧠", speaker: "🔊",
};
const TONES: Tone[] = ["teal", "violet", "amber", "emerald", "sky", "rose", "orange", "fuchsia", "slate", "lime"];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isBuyer, setIsBuyer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const user = getStoredUser();
      setIsBuyer(user?.role === "buyer");
      if (user?.role === "buyer") {
        try {
          setItems(await getCart());
        } catch { /* ignore */ }
      }
      setLoading(false);
    }
    load();
    window.addEventListener("auth-changed", load);
    return () => window.removeEventListener("auth-changed", load);
  }, []);

  async function updateQuantity(item: CartItem, change: number) {
    const quantity = item.quantity + change;
    if (quantity < 1) return removeItem(item.product_id);
    try {
      const updated = await updateCartItem(item.product_id, quantity);
      setItems((current) => current.map((ci) => (ci.product_id === item.product_id ? updated : ci)));
      window.dispatchEvent(new Event("cart-changed"));
    } catch {
      setMessage("Could not update quantity.");
    }
  }

  async function removeItem(productId: number) {
    try {
      await removeCartItem(productId);
      setItems((current) => current.filter((i) => i.product_id !== productId));
      window.dispatchEvent(new Event("cart-changed"));
    } catch {
      setMessage("Could not remove item.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900">
      <Header />
      <main className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Shopping Cart</h1>

        {message && (
          <p role="status" className="mb-4 rounded-lg bg-white border border-neutral-300 px-4 py-3 text-sm text-red-600">
            {message}
          </p>
        )}

        {!isBuyer ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center">
            <CartIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Sign in to view your cart</h2>
            <p className="text-sm text-neutral-500 mb-4">You need a buyer account to use the cart.</p>
            <Link href="/login" className="inline-block rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-teal-300">
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-4">
                  <div className="h-24 w-24 rounded-lg bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-neutral-200" />
                    <div className="h-4 w-32 rounded bg-neutral-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center">
            <CartIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Your cart is empty</h2>
            <p className="text-sm text-neutral-500 mb-4">Browse products and add them to your cart.</p>
            <Link href="/" className="inline-block rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-teal-300">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-300 bg-white divide-y divide-neutral-200">
            {items.map((item) => {
              const catName = item.product.category?.name?.toLowerCase().trim() ?? "";
              const emoji = CATEGORY_EMOJIS[catName] ?? "📦";
              const tone = TONES[(item.product.id - 1) % TONES.length];

              return (
                <div key={item.product_id} className="flex gap-4 p-4 sm:p-5">
                  <Link href={`/product/${item.product.id}`} className="shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-lg sm:h-28 sm:w-28">
                      <ImagePlaceholder emoji={emoji} tone={tone} label={item.product.name} className="h-full w-full" emojiClassName="text-4xl" />
                    </div>
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link href={`/product/${item.product.id}`} className="text-sm font-semibold text-neutral-900 hover:text-teal-700 line-clamp-2">
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {item.product.brand ?? "Unbranded"} · {item.product.category?.name ?? "Uncategorized"}
                    </p>

                    <div className="mt-auto flex items-center gap-3 pt-3">
                      <div className="flex items-center rounded-lg border border-neutral-300 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, -1)}
                          className="px-3 py-1.5 text-sm font-bold text-neutral-700 hover:bg-neutral-100"
                          aria-label={`Decrease ${item.product.name}`}
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold border-x border-neutral-300 bg-neutral-50 min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, 1)}
                          className="px-3 py-1.5 text-sm font-bold text-neutral-700 hover:bg-neutral-100"
                          aria-label={`Increase ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="p-4 sm:p-5 flex items-center justify-between bg-neutral-50">
              <p className="text-sm text-neutral-700">
                <strong>{items.reduce((t, i) => t + i.quantity, 0)}</strong> item{items.reduce((t, i) => t + i.quantity, 0) !== 1 ? "s" : ""} in cart
              </p>
              <Link
                href="/"
                className="rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-teal-300"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
