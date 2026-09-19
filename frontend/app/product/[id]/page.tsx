import ProductDetail from "@/components/ProductDetail";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getProduct } from "@/lib/api";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900">
      <Header />
      <ProductDetail product={product} />
      <Footer />
    </div>
  );
}