"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Link from "next/link";

import { addCartItem, getCart, getStoredUser, removeCartItem, updateCartItem, type CartItem } from "@/lib/api";
import type { Product } from "@/types/product";

export default function Cart({ products }: { products: Product[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCart() {
      const user = getStoredUser();
      setUserRole(user?.role ?? null);
      setIsHydrated(true);
      if (user?.role !== "buyer") {
        setItems([]);
        return;
      }
      try {
        setItems(await getCart());
        setMessage("");
      } catch {
        setMessage("Could not load your cart.");
      }
    }

    queueMicrotask(loadCart);
    window.addEventListener("auth-changed", loadCart);
    return () => window.removeEventListener("auth-changed", loadCart);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  async function addToCart(product: Product) {
    if (userRole !== "buyer") {
      setMessage("Sign in as a Buyer to use the cart.");
      return;
    }
    try {
      const item = await addCartItem(product.id);
      setItems((current) => {
        const existing = current.find((cartItem) => cartItem.product_id === product.id);
        return existing
          ? current.map((cartItem) => cartItem.product_id === product.id ? item : cartItem)
          : [...current, item];
      });
      setMessage("");
      setIsOpen(true);
    } catch {
      setMessage("Could not add this product to your cart.");
    }
  }

  async function updateQuantity(item: CartItem, change: number) {
    const quantity = item.quantity + change;
    if (quantity < 1) return removeItem(item.product_id);
    try {
      const updated = await updateCartItem(item.product_id, quantity);
      setItems((current) => current.map((cartItem) => cartItem.product_id === item.product_id ? updated : cartItem));
    } catch {
      setMessage("Could not update your cart.");
    }
  }

  async function removeItem(productId: number) {
    try {
      await removeCartItem(productId);
      setItems((current) => current.filter((item) => item.product_id !== productId));
    } catch {
      setMessage("Could not remove this item.");
    }
  }

  return (
    <section style={styles.section}>
      <div style={styles.toolbar}>
        <div>
          <h2 style={styles.heading}>Products</h2>
          <p style={styles.subheading}>Add products to your comparison cart.</p>
        </div>
        <button type="button" onClick={() => setIsOpen(true)} style={styles.cartButton} disabled={isHydrated && userRole !== "buyer"}>
          <ShoppingCart size={18} aria-hidden="true" /> Cart <span style={styles.badge}>{itemCount}</span>
        </button>
      </div>

      {message && <p role="status" style={styles.message}>{message}</p>}
      {products.length === 0 && <p>No products found.</p>}

      <div style={styles.grid}>
        {products.map((product) => {
          const cartItem = items.find((item) => item.product_id === product.id);
          return (
            <article key={product.id} style={styles.productCard}>
              <div>
                <h3 style={styles.productName}><Link href={`/product/${product.id}`} style={styles.link}>{product.name}</Link></h3>
                <p><strong>Category:</strong> {product.category?.name ?? "Uncategorized"}</p>
                <p><strong>Brand:</strong> {product.brand ?? "-"}</p>
              </div>
              <div>
                <h4>Specifications</h4>
                <ul>{product.specifications.map((specification) => <li key={specification.id}><strong>{specification.specification_name}:</strong>{" "}{specification.specification_value}</li>)}</ul>
              </div>
              <button type="button" onClick={() => addToCart(product)} style={styles.addButton}>
                <Plus size={17} aria-hidden="true" /> {cartItem ? `Add another (${cartItem.quantity})` : "Add to cart"}
              </button>
            </article>
          );
        })}
      </div>

      {isOpen && (
        <div style={styles.overlay} role="presentation" onClick={() => setIsOpen(false)}>
          <aside style={styles.panel} role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()}>
            <div style={styles.panelHeader}>
              <h2 id="cart-title" style={styles.heading}>Your cart</h2>
              <button type="button" onClick={() => setIsOpen(false)} style={styles.iconButton} aria-label="Close cart"><X size={20} aria-hidden="true" /></button>
            </div>
            {items.length === 0 ? <p>Your cart is empty.</p> : <div style={styles.cartItems}>{items.map((item) => <div key={item.product_id} style={styles.cartItem}>
              <div style={styles.cartItemDetails}><strong><Link href={`/product/${item.product.id}`} style={styles.link}>{item.product.name}</Link></strong><span>{item.product.brand ?? "Unbranded"}</span></div>
              <div style={styles.quantityControls}>
                <button type="button" onClick={() => updateQuantity(item, -1)} style={styles.iconButton} aria-label={`Decrease ${item.product.name}`}><Minus size={15} aria-hidden="true" /></button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item, 1)} style={styles.iconButton} aria-label={`Increase ${item.product.name}`}><Plus size={15} aria-hidden="true" /></button>
                <button type="button" onClick={() => removeItem(item.product_id)} style={styles.deleteButton} aria-label={`Remove ${item.product.name}`}><Trash2 size={16} aria-hidden="true" /></button>
              </div>
            </div>)}</div>}
          </aside>
        </div>
      )}
    </section>
  );
}

const styles = {
  section: { display: "grid", gap: "18px" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" },
  heading: { margin: 0, fontSize: "24px" },
  subheading: { margin: "6px 0 0", color: "#52606d" },
  message: { margin: 0, color: "#b42318" },
  cartButton: { display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 14px", border: 0, borderRadius: "5px", background: "#d97706", color: "white", cursor: "pointer", font: "inherit", fontWeight: 700 },
  badge: { minWidth: "20px", padding: "2px 5px", borderRadius: "10px", background: "white", color: "#9a4d05", textAlign: "center" as const, fontSize: "12px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" },
  productCard: { display: "grid", gap: "14px", padding: "20px", border: "1px solid #d8dee9", borderRadius: "8px", background: "#fff" },
  productName: { margin: 0, fontSize: "20px" },
  addButton: { display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "7px", padding: "10px 14px", border: 0, borderRadius: "5px", background: "#162b4d", color: "white", cursor: "pointer", font: "inherit", fontWeight: 700 },
  overlay: { position: "fixed" as const, inset: 0, display: "flex", justifyContent: "flex-end", background: "rgba(15, 23, 42, 0.4)", zIndex: 10 },
  panel: { width: "min(420px, 100%)", boxSizing: "border-box" as const, padding: "24px", background: "white", boxShadow: "-8px 0 24px rgba(15, 23, 42, 0.15)", overflowY: "auto" as const },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  iconButton: { display: "inline-grid", placeItems: "center", padding: "6px", border: "1px solid #d8dee9", borderRadius: "5px", background: "white", color: "#162b4d", cursor: "pointer" },
  cartItems: { display: "grid", gap: "14px" },
  cartItem: { display: "grid", gap: "12px", paddingBottom: "14px", borderBottom: "1px solid #e5e7eb" },
  cartItemDetails: { display: "grid", gap: "4px" },
  quantityControls: { display: "flex", alignItems: "center", gap: "10px" },
  deleteButton: { display: "inline-grid", placeItems: "center", marginLeft: "auto", padding: "6px", border: 0, background: "transparent", color: "#b42318", cursor: "pointer" },
  link: { color: "#162b4d", textDecoration: "none" },
};
