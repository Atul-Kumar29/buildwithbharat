import AddProductForm from "@/components/AddProductForm";
import AuthPanel from "@/components/AuthPanel";
import Cart from "@/components/Cart";
import SearchBar from "@/components/SearchBar";
import { getCategories, getProducts, searchProducts } from "@/lib/api";
import type { Product } from "@/types/product";

type HomeProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [data, categories] = await Promise.all([
    query ? searchProducts(query) : getProducts(),
    getCategories(),
  ]);

  return (
    <main style={{ padding: "40px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <h1>Product Comparison</h1>
        <AuthPanel />
      </header>

      <SearchBar initialQuery={query} />

      <AddProductForm categories={categories} />

      <h2>{query ? `Search results for "${query}"` : "All products"}</h2>

      <Cart products={data as Product[]} />
    </main>
  );
}