import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoCategoryGrid, RealCategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/home/ProductRail";
import { PersonalizedStrip } from "@/components/home/PersonalizedStrip";
import { SearchResults } from "@/components/home/SearchResults";
import { getCategories, getProducts, searchProducts } from "@/lib/api";
import { HERO_PROMOS, PROMO_CATEGORY_CARDS } from "@/lib/demo-data";

type HomeProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [products, categories] = await Promise.all([
    query ? searchProducts(query) : getProducts(),
    getCategories(),
  ]);

  // If searching, show search results in a focused layout
  if (query) {
    return (
      <div className="min-h-screen bg-neutral-200 text-neutral-900">
        <Header />
        <main className="mx-auto max-w-[1500px] px-3 py-6 sm:px-5">
          <SearchResults products={products} query={query} categories={categories} />
        </main>
        <Footer />
      </div>
    );
  }

  // Homepage layout
  return (
    <div className="min-h-screen bg-neutral-200 text-neutral-900">
      <Header />

      <main>
        <HeroCarousel cards={HERO_PROMOS} />

        <div className="mx-auto max-w-[1500px] space-y-7 px-3 pb-10 pt-7 sm:px-5">
          {/* Real categories from backend */}
          <RealCategoryGrid categories={categories} />

          {/* Real products from backend */}
          <ProductRail
            title="All Products"
            products={products}
            seeAllHref="/"
            seeAllLabel="Browse all"
          />

          {/* Promo category cards (demo data) */}
          <PromoCategoryGrid cards={PROMO_CATEGORY_CARDS.slice(0, 4)} />

          {/* Another product rail if enough products */}
          {products.length > 4 && (
            <ProductRail
              title="Recently Added"
              products={[...products].reverse().slice(0, 10)}
              showRank
            />
          )}
        </div>
      </main>

      <PersonalizedStrip />
      <Footer />
    </div>
  );
}