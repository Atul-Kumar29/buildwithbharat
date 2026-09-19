import type { Category, Product } from "@/types/product";

const API_URL = "http://127.0.0.1:8001";

export type UserRole = "seller" | "buyer";



export type Listing = {
  id: number;
  product_id: number;
  source_id: number | null;
  source: string;
  seller_name: string | null;
  listing_url: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export async function authenticate(
  mode: "login" | "register",
  credentials: { email: string; password: string; role?: UserRole }
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Authentication failed");
  }

  return response.json();
}

export function getAuthToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("access_token");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const storedUser = window.localStorage.getItem("auth_user");
  return storedUser ? JSON.parse(storedUser) : null;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type CartItem = { id: number; product_id: number; quantity: number; product: Product };

export async function getCart(): Promise<CartItem[]> {
  const response = await fetch(`${API_URL}/api/cart/`, { headers: authHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load cart");
  return response.json();
}

export async function addCartItem(productId: number, quantity = 1): Promise<CartItem> {
  const response = await fetch(`${API_URL}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  if (!response.ok) throw new Error("Failed to add item to cart");
  return response.json();
}

export async function updateCartItem(productId: number, quantity: number): Promise<CartItem> {
  const response = await fetch(`${API_URL}/api/cart/items/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error("Failed to update cart");
  return response.json();
}

export async function removeCartItem(productId: number) {
  const response = await fetch(`${API_URL}/api/cart/items/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to remove item from cart");
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProduct(productId: number): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${productId}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
}

export type Review = { id: number; product_id: number; user_id: number; rating: number; body: string; created_at: string };
export type Order = { id: number; user_id: number; product_id: number; quantity: number; status: "placed" | "shipped" | "delivered"; created_at: string; delivered_at: string | null };

export async function getReviews(productId: number): Promise<Review[]> {
  const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
}

export async function createReview(productId: number, review: { rating: number; body: string }) {
  const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(review) });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.detail ?? "Failed to submit review");
  return response.json() as Promise<Review>;
}

export async function placeOrder(productId: number) {
  const response = await fetch(`${API_URL}/api/orders/`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ product_id: productId }) });
  if (!response.ok) throw new Error("Failed to place order");
  return response.json() as Promise<Order>;
}

export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/api/orders/`, { headers: authHeaders(), cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch orders");
  return response.json();
}

export async function markDelivered(orderId: number) {
  const response = await fetch(`${API_URL}/api/orders/${orderId}/deliver`, { method: "POST", headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to update delivery");
  return response.json() as Promise<Order>;
}

export async function submitVerification(orderId: number, verification: { matches_listing: boolean; notes?: string }) {
  const response = await fetch(`${API_URL}/api/orders/${orderId}/verification`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(verification) });
  if (!response.ok) throw new Error("Failed to save feature verification");
  return response.json();
}

export type Comparison = {
  product_id: number;
  current_listing_id: number | null;
  seller_listings: { listing_id: number; seller_name: string | null; source: string; specifications: { specification_name: string; specification_value: string }[] }[];
  seller_modes: { specification_name: string; mode_value: string | null; frequency: number }[];
  manufacturer_specifications: { specification_name: string; specification_value: string }[];
  discrepancies: string[];
};

export async function getComparison(productId: number): Promise<Comparison> {
  const response = await fetch(`${API_URL}/api/comparison/products/${productId}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch comparison");
  return response.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/search/products?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to search products");
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
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
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
      ...authHeaders(),
    },
    body: JSON.stringify(specification),
  });

  if (!response.ok) {
    throw new Error("Failed to create product specification");
  }

  return response.json();
}
export async function getListings(): Promise<Listing[]> {
  const response = await fetch(`${API_URL}/api/listings/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return response.json();
}