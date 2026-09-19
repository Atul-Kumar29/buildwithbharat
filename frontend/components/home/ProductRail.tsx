"use client";

import { useRef } from "react";
import Link from "next/link";
import { ProductTile } from "./ProductTile";
import { ScrollArrow } from "@/components/ui/ScrollArrow";
import { useScrollArrows } from "@/components/ui/useScrollArrows";
import type { Product } from "@/types/product";

interface Props {
  title: string;
  products: Product[];
  seeAllHref?: string;
  seeAllLabel?: string;
  showRank?: boolean;
}

export function ProductRail({ title, products, seeAllHref, seeAllLabel = "See all", showRank = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { canPrev, canNext, scrollByPage } = useScrollArrows(ref);

  if (products.length === 0) return null;

  return (
    <section className="rounded-xl border border-neutral-300 bg-white p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4">
        <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm text-teal-700 hover:text-teal-900 hover:underline">
            {seeAllLabel}
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-1 scrollbar-hide motion-reduce:scroll-auto"
        >
          {products.map((product, i) => (
            <ProductTile
              key={product.id}
              product={product}
              rank={showRank ? i + 1 : undefined}
              className="w-[160px] shrink-0 sm:w-[185px] lg:w-[205px]"
            />
          ))}
        </div>
        {canPrev && <ScrollArrow dir="prev" onClick={() => scrollByPage(-1)} />}
        {canNext && <ScrollArrow dir="next" onClick={() => scrollByPage(1)} />}
      </div>
    </section>
  );
}
