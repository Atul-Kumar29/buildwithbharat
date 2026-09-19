import { StarIcon } from "./Icons";

function Stars() {
  return (
    <span className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className="h-4 w-4 shrink-0" />
      ))}
    </span>
  );
}

export function StarRating({ value, count }: { value: number; count: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const formatted = new Intl.NumberFormat("en-IN").format(count);
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`${value} out of 5 stars, ${formatted} ratings`}>
      <div className="relative text-neutral-300">
        <Stars />
        <div className="absolute inset-y-0 left-0 overflow-hidden text-amber-500" style={{ width: `${pct}%` }}>
          <Stars />
        </div>
      </div>
      <span className="text-xs text-teal-700">{formatted}</span>
    </div>
  );
}
