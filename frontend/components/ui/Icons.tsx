import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const CartIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20.5 7H6" />
  </svg>
);
export const PinIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
);
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>
);
export const UserIcon = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
);
export const GlobeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
  </svg>
);
export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const StarIcon = (p: IconProps) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5Z" />
  </svg>
);
export const PackageIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4A2 2 0 0 1 2 16.76V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0Z" />
    <path d="M2.32 6.16 12 11l9.68-4.84M12 22.76V11" />
  </svg>
);
export const PlusIcon = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
