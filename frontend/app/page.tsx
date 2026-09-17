import { getProducts } from "@/lib/api";

export default async function Home() {
  const data = await getProducts();

  return (
    <main style={{ padding: "40px" }}>
      <h1>Product Comparison</h1>

      <p>Data below is coming from the FastAPI backend.</p>

      {data.products.map((product: any) => (
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
            <strong>Seller:</strong> {product.seller}
          </p>

          <p>
            <strong>Price:</strong> ₹{product.price}
          </p>

          <h3>Specifications</h3>

          <ul>
            {Object.entries(product.specifications).map(
              ([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {String(value)}
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </main>
  );
}