"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ChevronDownIcon, GlobeIcon } from "@/components/ui/Icons";

const FOOTER_COLUMNS = [
  {
    title: "Get to Know Us",
    links: [
      { label: "About BuildWithBharat", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Press Releases", href: "/" },
    ],
  },
  {
    title: "Connect with Us",
    links: [
      { label: "Instagram", href: "#" },
      { label: "X", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
  {
    title: "Sell with Us",
    links: [
      { label: "Sell on BuildWithBharat", href: "/seller" },
      { label: "Seller Academy", href: "/" },
      { label: "Protect Your Brand", href: "/" },
      { label: "Advertise Your Products", href: "/" },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: "/login" },
      { label: "Returns Centre", href: "/" },
      { label: "Purchase Protection", href: "/" },
      { label: "Help", href: "/" },
    ],
  },
];

const FOOTER_SERVICES = [
  { name: "BWB Business", blurb: "Everything for your business" },
  { name: "BWB Pay", blurb: "Wallet, UPI & cashback" },
  { name: "BWB Fresh", blurb: "Groceries delivered daily" },
  { name: "BWB Compare", blurb: "Price & spec comparison" },
  { name: "BWB Cloud", blurb: "Storage for sellers" },
  { name: "BWB Insights", blurb: "Price history & trends" },
];

const selector =
  "flex items-center gap-2 rounded-md border border-slate-500 px-3 py-2 text-sm text-white hover:border-slate-300";

function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="block w-full bg-slate-700 py-4 text-center text-sm font-medium text-white hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
    >
      Back to top
    </button>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-slate-200 mt-auto">
      <BackToTop />

      <div className="bg-slate-800">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-x-6 gap-y-8 px-6 py-10 md:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-3 text-base font-bold text-white">{col.title}</h3>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white hover:underline">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-slate-700">
          <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-6">
            <Logo />
            <button type="button" className={selector}>
              <GlobeIcon className="h-4 w-4" />
              English
              <ChevronDownIcon className="h-3 w-3" />
            </button>
            <button type="button" className={selector}>
              <span aria-hidden>🇮🇳</span>
              India
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 px-6 py-8">
        <ul className="mx-auto grid max-w-[1000px] grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 md:grid-cols-6">
          {FOOTER_SERVICES.map((s) => (
            <li key={s.name}>
              <Link href="#" className="group block text-xs leading-snug text-slate-400">
                <span className="block font-semibold text-slate-200 group-hover:underline">{s.name}</span>
                {s.blurb}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-8 max-w-[1000px] text-center text-xs text-slate-300">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <Link href="/" className="hover:underline">Terms of Use &amp; Sale</Link>
            <Link href="/" className="hover:underline">Privacy Notice</Link>
            <Link href="/" className="hover:underline">Cookie Preferences</Link>
          </div>
          <p className="mt-2">
            &copy; {year} BuildWithBharat. Compare products from trusted sellers.
          </p>
        </div>
      </div>
    </footer>
  );
}
