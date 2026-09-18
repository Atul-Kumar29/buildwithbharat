import ProductDetail from "@/components/ProductDetail";
import { getProduct } from "@/lib/api";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  return <ProductDetail product={product} />;
}