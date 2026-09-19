import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { PromoCard } from "@/lib/demo-data";

const SIZE =
  "flex h-[440px] w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-lg p-5 sm:w-[46%] md:w-[31%] lg:h-[500px] lg:w-[23.5%] xl:w-[18.6%]";

const HEADLINE = "text-[34px] font-extrabold leading-[1.05] tracking-tight";

export function PromoCardView({ card }: { card: PromoCard }) {
  const text = card.theme === "dark" ? "text-white" : "text-neutral-900";
  const style = { background: `linear-gradient(165deg, ${card.from}, ${card.to})` };

  if (card.kind === "grid") {
    return (
      <Link href={card.href} className={`${SIZE} ${text}`} style={style}>
        <h2 className={HEADLINE}>{card.headline}</h2>
        <ul className="mt-5 grid flex-1 grid-cols-2 grid-rows-2 gap-2">
          {card.items.map((item) => (
            <li key={item.label} className="relative min-h-0 overflow-hidden rounded-md bg-white">
              <ImagePlaceholder
                emoji={item.emoji}
                tone={item.tone}
                label={item.label}
                className="h-full w-full"
                emojiClassName="text-5xl"
              />
              <span className="absolute bottom-1.5 left-1.5 rounded bg-teal-700 px-1.5 py-0.5 text-xs font-semibold text-white">
                {item.discount}
              </span>
            </li>
          ))}
        </ul>
      </Link>
    );
  }

  return (
    <Link href={card.href} className={`${SIZE} ${text}`} style={style}>
      <h2 className={HEADLINE}>{card.headline}</h2>
      <p className="mt-1 text-xl">{card.subhead}</p>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <span>{card.chips[0]}</span>
        <span aria-hidden className="h-4 w-px bg-current opacity-40" />
        <span>{card.chips[1]}</span>
      </div>

      <div className="flex flex-1 items-center justify-center py-3">
        <div
          aria-hidden
          className="grid aspect-square w-[68%] place-items-center rounded-full bg-white/30 text-[96px] leading-none"
        >
          <span className="drop-shadow-md">{card.emoji}</span>
        </div>
      </div>

      <div className="rounded-md bg-white px-3 py-2 text-neutral-900">
        <p className="text-[13px] font-bold leading-tight">{card.offer.headline}</p>
        <p className="text-[11px] text-neutral-600">{card.offer.sub}</p>
      </div>
    </Link>
  );
}
