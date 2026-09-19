import Link from "next/link";
import { ChevronDownIcon, MenuIcon } from "@/components/ui/Icons";

export interface NavLink {
  label: string;
  href: string;
  caret?: boolean;
}

const item =
  "flex items-center gap-1 whitespace-nowrap rounded-sm border border-transparent px-2.5 py-2 hover:border-white focus-visible:border-white focus-visible:outline-none";

export function SecondaryNav({
  links,
  onOpenMenu,
}: {
  links: NavLink[];
  onOpenMenu: () => void;
}) {
  return (
    <nav aria-label="Primary" className="bg-slate-800 text-sm text-white">
      <div className="mx-auto flex max-w-[1500px] items-center gap-0.5 overflow-x-auto px-2 py-0.5 scrollbar-hide sm:px-3">
        <button type="button" onClick={onOpenMenu} className={`${item} font-bold`}>
          <MenuIcon className="h-5 w-5" />
          All
        </button>
        {links.map((l) => (
          <Link key={l.label} href={l.href} className={item}>
            {l.label}
            {l.caret && <ChevronDownIcon className="h-3 w-3 text-slate-300" />}
          </Link>
        ))}
      </div>
    </nav>
  );
}
