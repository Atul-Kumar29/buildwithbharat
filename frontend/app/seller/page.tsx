import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AddProductForm from "@/components/AddProductForm";
import SellerListings from "@/components/SellerListings";
import { getCategories } from "@/lib/api";

export default async function SellerPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage your products and listings.</p>
        </div>

        <div className="grid gap-6">
          <AddProductForm categories={categories} />
          <SellerListings />
        </div>
      </main>
      <Footer />
    </div>
  );
}
