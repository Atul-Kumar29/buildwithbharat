export type Tone =
  | "sky" | "rose" | "amber" | "emerald" | "violet"
  | "slate" | "teal" | "orange" | "lime" | "fuchsia";

const TONES: Record<Tone, [string, string]> = {
  sky: ["#e0f2fe", "#7dd3fc"],
  rose: ["#ffe4e6", "#fda4af"],
  amber: ["#fef3c7", "#fcd34d"],
  emerald: ["#d1fae5", "#6ee7b7"],
  violet: ["#ede9fe", "#c4b5fd"],
  slate: ["#e2e8f0", "#94a3b8"],
  teal: ["#ccfbf1", "#5eead4"],
  orange: ["#ffedd5", "#fdba74"],
  lime: ["#ecfccb", "#bef264"],
  fuchsia: ["#fae8ff", "#f0abfc"],
};

interface Props {
  emoji: string;
  tone?: Tone;
  label?: string;
  className?: string;
  emojiClassName?: string;
}

/**
 * Emoji-based placeholder for product/category photography.
 * Swap with <Image /> from next/image when real assets exist.
 */
export function ImagePlaceholder({
  emoji,
  tone = "slate",
  label,
  className = "",
  emojiClassName = "text-6xl",
}: Props) {
  const [from, to] = TONES[tone];
  return (
    <div
      role="img"
      aria-label={label ?? "Placeholder image"}
      className={`grid place-items-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span aria-hidden className={`select-none drop-shadow-sm ${emojiClassName}`}>
        {emoji}
      </span>
    </div>
  );
}
