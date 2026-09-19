"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getOrders, getStoredUser, type Order } from "@/lib/api";
import { PackageIcon } from "@/components/ui/Icons";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isBuyer, setIsBuyer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = getStoredUser();
      setIsBuyer(user?.role === "buyer");
      if (user?.role === "buyer") {
        try {
          setOrders(await getOrders());
        } catch { /* ignore */ }
      }
      setLoading(false);
    }
    load();
    window.addEventListener("auth-changed", load);
    return () => window.removeEventListener("auth-changed", load);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900">
      <Header />
      <main className="mx-auto max-w-[900px] px-4 py-6 sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Your Orders</h1>

        {!isBuyer ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center">
            <PackageIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Sign in to view orders</h2>
            <p className="text-sm text-neutral-500 mb-4">You need a buyer account to see order history.</p>
            <Link href="/login" className="inline-block rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-teal-300">
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-40 rounded bg-neutral-200" />
              <div className="h-20 rounded bg-neutral-200" />
              <div className="h-20 rounded bg-neutral-200" />
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-neutral-300 bg-white p-8 text-center">
            <PackageIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
            <h2 className="text-lg font-bold text-neutral-900 mb-1">No orders yet</h2>
            <p className="text-sm text-neutral-500 mb-4">Start shopping to see your orders here.</p>
            <Link href="/" className="inline-block rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-teal-300">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-neutral-300 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Order #{order.id}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Product ID: {order.product_id} · Qty: {order.quantity}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Placed: {new Date(order.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    {order.delivered_at && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Delivered: {new Date(order.delivered_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/product/${order.product_id}`}
                    className="text-sm text-teal-700 hover:underline"
                  >
                    View product →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
