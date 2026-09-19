const POINTS = (() => {
  const spikes = 16;
  const outer = 50;
  const inner = 43;
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
})();

interface Props {
  top: string;
  value: string;
  className?: string;
}

/** Yellow price-burst badge for category tiles. */
export function StarburstBadge({ top, value, className = "" }: Props) {
  return (
    <div className={`relative h-14 w-14 -rotate-6 ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-sm" aria-hidden>
        <polygon points={POINTS} fill="#fde047" />
      </svg>
      <div className="relative flex h-full flex-col items-center justify-center text-center leading-none text-neutral-900">
        <span className="text-[9px] font-semibold">{top}</span>
        <span className="mt-0.5 text-[15px] font-extrabold">{value}</span>
      </div>
    </div>
  );
}
