"use client";

import { useRef } from "react";
import { PromoCardView } from "./PromoCard";
import { ScrollArrow } from "@/components/ui/ScrollArrow";
import { useScrollArrows } from "@/components/ui/useScrollArrows";
import type { PromoCard } from "@/lib/demo-data";

export function HeroCarousel({ cards }: { cards: PromoCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { canPrev, canNext, scrollByPage } = useScrollArrows(ref);

  return (
    <section aria-label="Featured promotions" className="mx-auto max-w-[1500px] px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="relative">
        <div
          ref={ref}
          className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth scrollbar-hide motion-reduce:scroll-auto"
        >
          {cards.map((card) => (
            <PromoCardView key={card.id} card={card} />
          ))}
        </div>
        {canPrev && <ScrollArrow dir="prev" onClick={() => scrollByPage(-1)} />}
        {canNext && <ScrollArrow dir="next" onClick={() => scrollByPage(1)} />}
      </div>
    </section>
  );
}
