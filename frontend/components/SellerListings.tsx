"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredUser, getListings, type Listing } from "@/lib/api";
import { PackageIcon } from "@/components/ui/Icons";

export default function SellerListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = getStoredUser();
      setIsSeller(user?.role === "seller");
      if (user?.role === "seller") {
        try {
          const data = await getListings();
          setListings(data);
        } catch { /* ignore */ }
      }
      setLoading(false);
    }
    load();
    window.addEventListener("auth-changed", load);
    return () => window.removeEventListener("auth-changed", load);
  }, []);

  if (!isSeller) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-6 text-center">
        <PackageIcon className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Seller Access Required</h2>
        <p className="text-sm text-neutral-500 mb-4">Sign in as a seller to manage listings.</p>
        <Link href="/login" className="inline-block rounded-lg bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-40 rounded bg-neutral-200" />
          <div className="h-4 w-60 rounded bg-neutral-200" />
          <div className="h-20 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-neutral-900">My Listings</h2>
        <p className="mt-1 text-sm text-neutral-500">
          {listings.length} listing{listings.length !== 1 ? "s" : ""} across all products.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
          <PackageIcon className="mx-auto h-10 w-10 text-neutral-300 mb-2" />
          <p className="text-sm text-neutral-500">
            No listings yet. Add a product above and create seller listings to compare specs.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Listing #{listing.id}
                </p>
                <p className="text-xs text-neutral-500">
                  Product ID: {listing.product_id} · Source: {listing.source ?? "N/A"} · Seller: {listing.seller_name ?? "N/A"}
                </p>
              </div>
              <Link
                href={`/product/${listing.product_id}`}
                className="text-xs text-teal-700 hover:underline"
              >
                View product
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
