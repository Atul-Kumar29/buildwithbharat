import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface Props {
  dir: "prev" | "next";
  onClick: () => void;
  className?: string;
}

export function ScrollArrow({ dir, onClick, className = "" }: Props) {
  const isNext = dir === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isNext ? "Scroll right" : "Scroll left"}
      className={`absolute top-1/2 z-10 grid h-20 w-10 -translate-y-1/2 place-items-center bg-white text-neutral-800 shadow-md ring-1 ring-black/10 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 ${
        isNext ? "right-0 rounded-l-lg" : "left-0 rounded-r-lg"
      } ${className}`}
    >
      {isNext ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
    </button>
  );
}
