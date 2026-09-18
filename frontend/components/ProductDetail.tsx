"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import ComparisonTables from "@/components/ComparisonTables";
import { createReview, getComparison, getOrders, getReviews, getStoredUser, markDelivered, placeOrder, submitVerification, type Comparison, type Order, type Review } from "@/lib/api";
import type { Product } from "@/types/product";

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
  }, [product.id]);

  async function submitReviewForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { setReviews([await createReview(product.id, { rating, body }), ...reviews]); setBody(""); setMessage("Review submitted."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit review."); }
  }

  async function buyProduct() {
    try { const order = await placeOrder(product.id); setOrders([order, ...orders]); setMessage("Mock order placed."); } catch { setMessage("Sign in as a Buyer to buy this product."); }
  }

  async function deliverOrder(order: Order) {
    try { const updated = await markDelivered(order.id); setOrders(orders.map((item) => item.id === order.id ? updated : item)); setMessage("Order marked as delivered."); } catch { setMessage("Could not update delivery."); }
  }

  async function verifyOrder(event: FormEvent<HTMLFormElement>, order: Order) {
    event.preventDefault();
    try { await submitVerification(order.id, { matches_listing: matches, notes: notes || undefined }); setOrders(orders.map((item) => item.id === order.id ? { ...item } : item)); setNotes(""); setMessage("Feature verification saved."); } catch { setMessage("Could not save verification."); }
  }

  const productOrder = orders.find((order) => order.product_id === product.id);

  return <main style={styles.main}>
    <Link href="/" style={styles.back}>Back to products</Link>
    <section style={styles.product}><h1>{product.name}</h1>{comparison?.discrepancies.length ? <p role="alert" style={styles.warning}>Check this product: {comparison.discrepancies.slice(0, 3).join("; ")}{comparison.discrepancies.length > 3 ? " ..." : ""}</p> : null}<p><strong>Brand:</strong> {product.brand ?? "-"}</p><p><strong>Category:</strong> {product.category?.name ?? "Uncategorized"}</p><h2>Product features</h2><ul>{product.specifications.map((specification) => <li key={specification.id}><strong>{specification.specification_name}:</strong> {specification.specification_value}</li>)}</ul>
      <button type="button" onClick={buyProduct} style={styles.buyButton}>Buy now</button>
    </section>
    {message && <p role="status" style={styles.message}>{message}</p>}
    {comparison && <ComparisonTables comparison={comparison} />}
    {productOrder?.status === "placed" && <section style={styles.section}><h2>Mock delivery</h2><p>Order #{productOrder.id} is on its way.</p><button type="button" onClick={() => deliverOrder(productOrder)} style={styles.button}>Mark as delivered</button></section>}
    {productOrder?.status === "delivered" && <section style={styles.section}><h2>Confirm product features</h2><form onSubmit={(event) => verifyOrder(event, productOrder)} style={styles.form}><label style={styles.label}>Do the received features match the listing?<select value={String(matches)} onChange={(event) => setMatches(event.target.value === "true")} style={styles.input}><option value="true">Yes, they match</option><option value="false">No, they do not match</option></select></label><label style={styles.label}>Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} style={styles.input} /></label><button type="submit" style={styles.button}>Save confirmation</button></form></section>}
    <section style={styles.section}><h2>Customer reviews</h2>{isBuyer && <form onSubmit={submitReviewForm} style={styles.form}><label style={styles.label}>Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))} style={styles.input}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label><label style={styles.label}>Review<textarea required value={body} onChange={(event) => setBody(event.target.value)} style={styles.input} /></label><button type="submit" style={styles.button}>Post review</button></form>}{reviews.length === 0 ? <p>No reviews yet.</p> : reviews.map((review) => <article key={review.id} style={styles.review}><strong>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</strong><p>{review.body}</p></article>)}</section>
  </main>;
}

const styles = { main: { maxWidth: "860px", margin: "0 auto", padding: "40px 24px", display: "grid", gap: "24px" }, back: { color: "#162b4d" }, product: { padding: "28px", border: "1px solid #d8dee9", borderRadius: "8px", background: "#fff" }, warning: { margin: "8px 0 16px", padding: "10px 12px", borderLeft: "4px solid #d97706", background: "#fff7ed", color: "#9a4d05" }, section: { display: "grid", gap: "14px" }, form: { display: "grid", gap: "12px", padding: "18px", border: "1px solid #d8dee9", borderRadius: "8px", background: "#f8fafc" }, label: { display: "grid", gap: "6px", fontWeight: 600 }, input: { padding: "9px 10px", border: "1px solid #b8c2cc", borderRadius: "5px", background: "white", font: "inherit", fontWeight: 400 }, button: { width: "fit-content", padding: "10px 14px", border: 0, borderRadius: "5px", background: "#162b4d", color: "white", cursor: "pointer", font: "inherit", fontWeight: 700 }, buyButton: { padding: "12px 18px", border: 0, borderRadius: "5px", background: "#d97706", color: "white", cursor: "pointer", font: "inherit", fontWeight: 700 }, message: { color: "#52606d" }, review: { padding: "14px 0", borderBottom: "1px solid #e5e7eb" } };