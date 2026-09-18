"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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
      setStatus("Product added.");
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
    <form onSubmit={handleSubmit} style={styles.form}>
      <div>
        <h2 style={styles.heading}>Add a product</h2>
        <p style={styles.subheading}>Save a canonical product to compare later.</p>
      </div>

      <label style={styles.label}>
        Product name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Dell Inspiron 15 3530"
          style={styles.input}
        />
      </label>

      <div style={styles.row}>
        <label style={styles.label}>
          Brand
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Dell"
            style={styles.input}
          />
        </label>
        <label style={styles.label}>
          ASIN
          <input
            value={asin}
            onChange={(event) => setAsin(event.target.value)}
            placeholder="B0..."
            style={styles.input}
          />
        </label>
      </div>

      <label style={styles.label}>
        Category
        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setSpecifications({});
          }}
          style={styles.input}
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
        <div style={styles.specificationSection}>
          <div>
            <h3 style={styles.specificationHeading}>Product specifications</h3>
            <p style={styles.subheading}>Add the details available for this product.</p>
          </div>
          <div style={styles.specificationGrid}>
            {fields.map((field) => (
              <label key={field} style={styles.label}>
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
                  style={styles.input}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <button type="submit" disabled={isSubmitting} style={styles.button}>
          <Plus size={17} aria-hidden="true" />
          {isSubmitting ? "Adding..." : "Add product"}
        </button>
        {status && <span role="status" style={styles.status}>{status}</span>}
      </div>
    </form>
  );
}

const styles = {
  form: {
    display: "grid",
    gap: "16px",
    padding: "24px",
    border: "1px solid #d8dee9",
    borderRadius: "8px",
    background: "#f8fafc",
  },
  heading: { margin: 0, fontSize: "24px" },
  subheading: { margin: "6px 0 0", color: "#52606d" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  specificationSection: {
    display: "grid",
    gap: "14px",
    paddingTop: "4px",
  },
  specificationHeading: { margin: 0, fontSize: "18px" },
  specificationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  label: { display: "grid", gap: "7px", fontWeight: 600 },
  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    border: "1px solid #b8c2cc",
    borderRadius: "5px",
    background: "white",
    font: "inherit",
    fontWeight: 400,
  },
  footer: { display: "flex", alignItems: "center", gap: "14px" },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 15px",
    border: 0,
    borderRadius: "5px",
    background: "#162b4d",
    color: "white",
    cursor: "pointer",
    font: "inherit",
    fontWeight: 700,
  },
  status: { color: "#52606d" },
};