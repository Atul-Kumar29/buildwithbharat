"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@/components/ui/Icons";
import { createProduct, createProductSpecification } from "@/lib/api";
import type { Category } from "@/types/product";

const specificationFields: Record<string, string[]> = {
  laptop: ["CPU", "RAM", "Storage", "Display", "GPU", "Battery"],
  gpu: ["VRAM", "CUDA Cores / Stream Processors", "Memory Type", "Memory Bus", "Base Clock", "Boost Clock"],
  earphone: ["Driver Size", "Connectivity", "Microphone", "Battery Life", "Noise Cancellation", "Water Resistance"],
  headphones: ["Driver Size", "Connectivity", "Microphone", "Battery Life", "Noise Cancellation", "Water Resistance"],
  mobile: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  mobiles: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  phone: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  smartphone: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  tablet: ["Processor", "RAM", "Storage", "Display", "Battery", "Camera"],
  cpu: ["Socket", "Cores", "Threads", "Base Clock", "Boost Clock", "TDP"],
  monitor: ["Display Size", "Resolution", "Refresh Rate", "Panel Type", "Response Time", "Ports"],
  keyboard: ["Layout", "Switch Type", "Connectivity", "Backlight", "Polling Rate", "Compatibility"],
  mouse: ["Sensor", "DPI", "Connectivity", "Buttons", "Polling Rate", "Compatibility"],
  smartwatch: ["Display", "Battery Life", "Water Resistance", "Connectivity", "Sensors", "Compatibility"],
  camera: ["Sensor", "Resolution", "Lens Mount", "Video Resolution", "ISO Range", "Connectivity"],
  router: ["Wi-Fi Standard", "Speed", "Bands", "Coverage", "Ports", "Security"],
  printer: ["Print Technology", "Print Speed", "Resolution", "Connectivity", "Duplex", "Supported Paper"],
  television: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "Smart Platform", "Connectivity"],
  storage: ["Capacity", "Type", "Interface", "Read Speed", "Write Speed", "Form Factor"],
};

function getFieldsForCategory(categoryName: string) {
  return specificationFields[categoryName.toLowerCase()] ?? [];
}

export default function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [asin, setAsin] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const updateRole = () => {
      const storedUser = window.localStorage.getItem("auth_user");
      setIsSeller(storedUser ? JSON.parse(storedUser).role === "seller" : false);
    };
    updateRole();
    window.addEventListener("auth-changed", updateRole);
    return () => window.removeEventListener("auth-changed", updateRole);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      const product = await createProduct({
        name,
        asin: asin || undefined,
        brand: brand || undefined,
        category_id: categoryId ? Number(categoryId) : null,
      });

      await Promise.all(
        Object.entries(specifications)
          .filter(([, value]) => value.trim())
          .map(([specification_name, specification_value]) =>
            createProductSpecification(product.id, {
              specification_name,
              specification_value: specification_value.trim(),
            })
          )
      );

      setName("");
      setAsin("");
      setBrand("");
      setCategoryId("");
      setSpecifications({});
      setStatus("Product added successfully!");
      router.refresh();
    } catch {
      setStatus("Could not add the product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCategory = categories.find((category) => String(category.id) === categoryId);
  const fields = selectedCategory ? getFieldsForCategory(selectedCategory.name) : [];

  if (!isSeller) return null;

  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-neutral-900">Add a Product</h2>
        <p className="mt-1 text-sm text-neutral-500">Save a canonical product to compare across sellers.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 max-w-2xl">
        <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
          Product name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Dell Inspiron 15 3530"
            className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
            Brand
            <input
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Dell"
              className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
            ASIN
            <input
              value={asin}
              onChange={(event) => setAsin(event.target.value)}
              placeholder="B0..."
              className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-neutral-700">
          Category
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setSpecifications({});
            }}
            className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {fields.length > 0 && (
          <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Product Specifications</h3>
            <p className="text-xs text-neutral-500 mb-3">Add the details available for this product.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field} className="grid gap-1 text-sm font-medium text-neutral-700">
                  {field}
                  <input
                    value={specifications[field] ?? ""}
                    onChange={(event) =>
                      setSpecifications((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    placeholder={`Enter ${field.toLowerCase()}`}
                    className="rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-teal-300 disabled:opacity-50 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            {isSubmitting ? "Adding..." : "Add product"}
          </button>
          {status && (
            <span role="status" className={`text-sm ${status.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
              {status}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}