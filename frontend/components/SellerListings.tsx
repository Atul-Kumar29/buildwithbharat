"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  getStoredUser,
  getListings,
  getProducts,
  getListingSpecifications,
  createListingSpecification,
  type Listing,
  type ListingSpecification,
} from "@/lib/api";
import type { Product } from "@/types/product";
import { PackageIcon } from "@/components/ui/Icons";

const specificationFields: Record<string, string[]> = {
  laptop: ["CPU", "RAM", "Storage", "Display", "GPU", "Battery"],
  gpu: [
    "VRAM",
    "CUDA Cores / Stream Processors",
    "Memory Type",
    "Memory Bus",
    "Base Clock",
    "Boost Clock",
  ],
  earphone: [
    "Driver Size",
    "Connectivity",
    "Microphone",
    "Battery Life",
    "Noise Cancellation",
    "Water Resistance",
  ],
  headphones: [
    "Driver Size",
    "Connectivity",
    "Microphone",
    "Battery Life",
    "Noise Cancellation",
    "Water Resistance",
  ],
  mobile: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  phone: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  smartphone: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  tablet: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  cpu: ["Socket", "Cores", "Threads", "Base Clock", "Boost Clock", "TDP"],
  monitor: [
    "Display Size",
    "Resolution",
    "Refresh Rate",
    "Panel Type",
    "Response Time",
    "Ports",
  ],
  keyboard: [
    "Layout",
    "Switch Type",
    "Connectivity",
    "Backlight",
    "Polling Rate",
    "Compatibility",
  ],
  mouse: [
    "Sensor",
    "DPI",
    "Connectivity",
    "Buttons",
    "Polling Rate",
    "Compatibility",
  ],
  smartwatch: [
    "Display",
    "Battery Life",
    "Water Resistance",
    "Connectivity",
    "Sensors",
    "Compatibility",
  ],
  camera: [
    "Sensor",
    "Resolution",
    "Lens Mount",
    "Video Resolution",
    "ISO Range",
    "Connectivity",
  ],
  router: [
    "Wi-Fi Standard",
    "Speed",
    "Bands",
    "Coverage",
    "Ports",
    "Security",
  ],
  printer: [
    "Print Technology",
    "Print Speed",
    "Resolution",
    "Connectivity",
    "Duplex",
    "Supported Paper",
  ],
  television: [
    "Screen Size",
    "Resolution",
    "Panel Type",
    "Refresh Rate",
    "Smart Platform",
    "Connectivity",
  ],
  storage: [
    "Capacity",
    "Type",
    "Interface",
    "Read Speed",
    "Write Speed",
    "Form Factor",
  ],
};

function getFieldsForCategory(categoryName?: string | null) {
  if (!categoryName) return [];
  return specificationFields[categoryName.toLowerCase()] ?? [];
}

export default function SellerListings() {

  const [listings, setListings] = useState<Listing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const [productId, setProductId] = useState("");
  const [source, setSource] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [title, setTitle] = useState("");
  const [specifications, setSpecifications] = useState<
  Record<number, ListingSpecification[]>
>({});
const [specificationValues, setSpecificationValues] = useState<
  Record<number, Record<string, string>>
>({});
const [expandedListing, setExpandedListing] = useState<number | null>(null);
const [savingSpecifications, setSavingSpecifications] = useState<number | null>(
  null
);

  async function load() {
    const user = getStoredUser();
    const seller = user?.role === "seller";

    setIsSeller(seller);

    if (seller) {
      try {
        const [listingData, productData] = await Promise.all([
  getListings(),
  getProducts(),
]);

setListings(listingData);
setProducts(productData);

const specificationEntries = await Promise.all(
  listingData.map(async (listing) => {
    const data = await getListingSpecifications(listing.id);
    return [listing.id, data] as const;
  })
);

setSpecifications(Object.fromEntries(specificationEntries));
      } catch {
        // Ignore loading errors for now.
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    window.addEventListener("auth-changed", load);

    return () => window.removeEventListener("auth-changed", load);
  }, []);

  async function handleSaveSpecifications(listing: Listing) {
  const values = specificationValues[listing.id] ?? {};

  const entries = Object.entries(values).filter(
    ([, value]) => value.trim() !== ""
  );

  if (entries.length === 0) return;

  setSavingSpecifications(listing.id);

  try {
    await Promise.all(
      entries.map(([specification_name, specification_value]) =>
        createListingSpecification(listing.id, {
          specification_name,
          specification_value: specification_value.trim(),
        })
      )
    );

    const updated = await getListingSpecifications(listing.id);

    setSpecifications((current) => ({
      ...current,
      [listing.id]: updated,
    }));

    setSpecificationValues((current) => ({
      ...current,
      [listing.id]: {},
    }));
  } finally {
    setSavingSpecifications(null);
  }
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const token = window.localStorage.getItem("access_token");

      const response = await fetch("http://127.0.0.1:8001/api/listings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: Number(productId),
          source,
          seller_name: sellerName || null,
          listing_url: listingUrl || null,
          title: title || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail ?? "Failed to create listing");
      }

      setStatus("Listing created successfully.");

      setProductId("");
      setSource("");
      setSellerName("");
      setListingUrl("");
      setTitle("");

      await load();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Could not create listing."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSeller) {
    return (
      <div className="rounded-xl border border-neutral-300 bg-white p-6 text-center">
        <PackageIcon className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
        <h2 className="mb-1 text-lg font-bold text-neutral-900">
          Seller Access Required
        </h2>
        <p className="mb-4 text-sm text-neutral-500">
          Sign in as a seller to manage listings.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300"
        >
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
        <h2 className="text-xl font-bold text-neutral-900">
          Create Seller Listing
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Connect an existing product to a seller/source.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 grid max-w-2xl gap-4">
        <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
          Product
          <select
            required
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {product.asin ? ` (${product.asin})` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
            Source
            <input
              required
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Amazon"
              className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
            Seller name
            <input
              value={sellerName}
              onChange={(event) => setSellerName(event.target.value)}
              placeholder="Seller name"
              className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
          Listing URL
          <input
            type="url"
            value={listingUrl}
            onChange={(event) => setListingUrl(event.target.value)}
            placeholder="https://..."
            className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
          Listing title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Product listing title"
            className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-teal-300 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create listing"}
          </button>

          {status && (
            <span
              className={`text-sm ${
                status.includes("successfully")
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {status}
            </span>
          )}
        </div>
      </form>

      <div>
        <h3 className="mb-1 text-lg font-bold text-neutral-900">
          My Listings
        </h3>

        <p className="mb-4 text-sm text-neutral-500">
          {listings.length} listing{listings.length !== 1 ? "s" : ""} across
          all products.
        </p>

        {listings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center">
            <PackageIcon className="mx-auto mb-2 h-10 w-10 text-neutral-300" />
            <p className="text-sm text-neutral-500">
              No listings yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {listings.map((listing) => {
  const product = products.find(
    (item) => item.id === listing.product_id
  );

  const fields = getFieldsForCategory(product?.category?.name);

  return (
    <div
      key={listing.id}
      className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            Listing #{listing.id}
          </p>

          <p className="text-xs text-neutral-500">
            Product ID: {listing.product_id} · Source:{" "}
            {listing.source ?? "N/A"} · Seller:{" "}
            {listing.seller_name ?? "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/product/${listing.product_id}`}
            className="text-xs text-teal-700 hover:underline"
          >
            View product
          </Link>

          <button
            type="button"
            onClick={() =>
              setExpandedListing(
                expandedListing === listing.id ? null : listing.id
              )
            }
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            {expandedListing === listing.id
              ? "Hide specifications"
              : "Add specifications"}
          </button>
        </div>
      </div>

      {expandedListing === listing.id && (
        <div className="mt-4 border-t border-neutral-200 pt-4">
          {fields.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No specification fields are configured for this product
              category.
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <label
                    key={field}
                    className="grid gap-1 text-sm font-medium text-neutral-700"
                  >
                    {field}

                    <input
                      value={
                        specificationValues[listing.id]?.[field] ?? ""
                      }
                      onChange={(event) =>
                        setSpecificationValues((current) => ({
                          ...current,
                          [listing.id]: {
                            ...current[listing.id],
                            [field]: event.target.value,
                          },
                        }))
                      }
                      placeholder={`Enter ${field.toLowerCase()}`}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSaveSpecifications(listing)}
                disabled={savingSpecifications === listing.id}
                className="mt-4 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-teal-300 disabled:opacity-50"
              >
                {savingSpecifications === listing.id
                  ? "Saving..."
                  : "Save specifications"}
              </button>
            </>
          )}

          {(specifications[listing.id] ?? []).length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 text-sm font-bold text-neutral-900">
                Saved specifications
              </h4>

              <div className="grid gap-2 sm:grid-cols-2">
                {specifications[listing.id].map((specification) => (
                  <div
                    key={specification.id}
                    className="rounded-md border border-neutral-200 bg-white px-3 py-2"
                  >
                    <p className="text-xs text-neutral-500">
                      {specification.specification_name}
                    </p>

                    <p className="text-sm font-medium text-neutral-900">
                      {specification.specification_value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
            })}
          </div>
        )}
      </div>
    </div>
  );
}