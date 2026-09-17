import AddProductForm from "@/components/AddProductForm";
import { getCategories, getProducts } from "@/lib/api";
import type { Product } from "@/types/product";

export default async function Home() {
  const [data, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <main style={{ padding: "40px" }}>
      <h1>Product Comparison</h1>

      <AddProductForm categories={categories} />

      {data.map((product: Product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            marginTop: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>{product.name}</h2>

          <p>
            <strong>Category:</strong> {product.category?.name ?? "Uncategorized"}
          </p>

          <p>
            <strong>Brand:</strong> {product.brand ?? "-"}
          </p>

          <h3>Specifications</h3>

          <ul>
            {product.specifications.map((specification) => (
                <li key={specification.id}>
                  <strong>{specification.specification_name}:</strong>{" "}
                  {specification.specification_value}
                </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}