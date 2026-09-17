import type { Category, Product } from "@/types/product";

const API_URL = "http://127.0.0.1:8000";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export async function createProduct(product: {
  name: string;
  asin?: string;
  brand?: string;
  category_id?: number | null;
}) {
  const response = await fetch(`${API_URL}/api/products/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Failed to create product");
  }

  return response.json();
}

export async function createProductSpecification(
  productId: number,
  specification: { specification_name: string; specification_value: string }
) {
  const response = await fetch(`${API_URL}/api/products/${productId}/specifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(specification),
  });

  if (!response.ok) {
    throw new Error("Failed to create product specification");
  }

  return response.json();
}