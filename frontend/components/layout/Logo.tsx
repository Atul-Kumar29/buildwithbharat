import Link from "next/link";

const BRAND = { name: "BuildWithBharat", short: "BWB" };

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${BRAND.name} home`}
      className={`flex items-center gap-1.5 rounded-sm border border-transparent px-2 py-1 hover:border-white ${className}`}
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-teal-400 text-lg font-extrabold leading-none text-slate-900">
        B
      </span>
      <span className="text-[22px] font-extrabold leading-none tracking-tight text-white sm:text-[26px]">
        {BRAND.name}
        <span className="text-teal-400">.</span>
      </span>
    </Link>
  );
}
