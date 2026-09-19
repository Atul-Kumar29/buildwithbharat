"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { NavDrawer, type LinkGroup } from "./NavDrawer";
import { SecondaryNav, type NavLink } from "./SecondaryNav";
import {
  CartIcon,
  ChevronDownIcon,
  PinIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { authenticate, getCart, getStoredUser, type AuthUser, type UserRole } from "@/lib/api";

/* ---------- Navigation data ---------- */

const NAV_LINKS: NavLink[] = [
  { label: "Today's Deals", href: "/" },
  { label: "Bestsellers", href: "/" },
  { label: "New Arrivals", href: "/" },
  { label: "Electronics", href: "/" },
  { label: "Compare", href: "/" },
  { label: "Sell", href: "/seller" },
  { label: "Customer Service", href: "/" },
];

const DRAWER_SECTIONS: LinkGroup[] = [
  {
    title: "Trending",
    links: [
      { label: "Bestsellers", href: "/" },
      { label: "New arrivals", href: "/" },
      { label: "Today's deals", href: "/" },
    ],
  },
  {
    title: "Shop by category",
    links: [
      { label: "Electronics", href: "/" },
      { label: "Home & kitchen", href: "/" },
      { label: "Fashion & footwear", href: "/" },
    ],
  },
  {
    title: "Compare & sell",
    links: [
      { label: "Compare products", href: "/" },
      { label: "Seller dashboard", href: "/seller" },
    ],
  },
  {
    title: "Help & settings",
    links: [
      { label: "Your account", href: "/login" },
      { label: "Your orders", href: "/orders" },
      { label: "Sign in", href: "/login" },
    ],
  },
];

const SEARCH_CATEGORIES = ["All", "Electronics", "Mobiles", "Laptops", "Headphones"];

/* ---------- Hover-outline for header controls ---------- */

const control =
  "rounded-sm border border-transparent px-2 py-1.5 hover:border-white focus-visible:border-white focus-visible:outline-none";

/* ---------- Inline Search ---------- */

function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex h-10 overflow-hidden rounded-md focus-within:ring-2 focus-within:ring-teal-400"
    >
      <label htmlFor="hdr-category" className="sr-only">Search category</label>
      <select
        id="hdr-category"
        className="hidden max-w-[120px] shrink-0 cursor-pointer border-r border-neutral-300 bg-neutral-100 px-2.5 text-xs text-neutral-700 hover:bg-neutral-200 focus:outline-none sm:block"
      >
        {SEARCH_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <label htmlFor="hdr-query" className="sr-only">Search products</label>
      <input
        id="hdr-query"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands and ASIN"
        className="min-w-0 flex-1 bg-white px-3 text-[15px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="grid w-12 shrink-0 place-items-center bg-teal-400 text-slate-900 hover:bg-teal-300"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

/* ---------- Account flyout ---------- */

function AccountFlyout() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => {
      const stored = getStoredUser();
      setUser(stored);
    };
    sync();
    window.addEventListener("auth-changed", sync);
    return () => window.removeEventListener("auth-changed", sync);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const result = await authenticate(mode, { email, password, ...(mode === "register" ? { role } : {}) });
      window.localStorage.setItem("access_token", result.access_token);
      window.localStorage.setItem("auth_user", JSON.stringify(result.user));
      setUser(result.user);
      setEmail("");
      setPassword("");
      setShowForm(false);
      window.dispatchEvent(new Event("auth-changed"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  function logout() {
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("auth_user");
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  }

  if (user) {
    return (
      <div className="group relative hidden sm:block">
        <button type="button" className={`${control} text-left leading-tight`}>
          <span className="block text-xs">Hello, {user.email.split("@")[0]}</span>
          <span className="flex items-center gap-0.5 whitespace-nowrap text-sm font-bold">
            {user.role === "seller" ? "Seller" : "Account"}
            <ChevronDownIcon className="h-3 w-3 text-slate-300" />
          </span>
        </button>
        <div className="invisible absolute right-0 top-full z-40 w-[280px] pt-1 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
          <div className="rounded-md bg-white p-4 text-neutral-900 shadow-xl ring-1 ring-black/10">
            <p className="text-sm mb-2">
              <strong>{user.role === "seller" ? "Seller" : "Buyer"}</strong> · {user.email}
            </p>
            {user.role === "seller" && (
              <Link href="/seller" className="block text-sm text-teal-700 hover:underline mb-2">
                Seller Dashboard
              </Link>
            )}
            <Link href="/orders" className="block text-sm text-teal-700 hover:underline mb-3">
              Your Orders
            </Link>
            <button
              onClick={logout}
              className="w-full rounded-lg bg-neutral-100 py-2 text-center text-sm font-semibold text-neutral-800 hover:bg-neutral-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative hidden sm:block">
      <button type="button" className={`${control} text-left leading-tight`}>
        <span className="block text-xs">Hello, sign in</span>
        <span className="flex items-center gap-0.5 whitespace-nowrap text-sm font-bold">
          Account &amp; Lists
          <ChevronDownIcon className="h-3 w-3 text-slate-300" />
        </span>
      </button>
      <div className="invisible absolute right-0 top-full z-40 w-[320px] pt-1 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="rounded-md bg-white p-4 text-neutral-900 shadow-xl ring-1 ring-black/10">
          {!showForm ? (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="block w-full rounded-lg bg-teal-400 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-teal-300"
              >
                Sign in
              </button>
              <p className="mt-2 text-center text-xs">
                New customer?{" "}
                <button onClick={() => { setShowForm(true); setMode("register"); }} className="text-teal-700 hover:underline">
                  Start here.
                </button>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-3">
              <div className="flex gap-2 border-b border-neutral-200 pb-2">
                <button type="button" onClick={() => setMode("login")} className={`text-sm px-2 pb-1 ${mode === "login" ? "font-bold border-b-2 border-teal-500" : "text-neutral-500"}`}>Sign in</button>
                <button type="button" onClick={() => setMode("register")} className={`text-sm px-2 pb-1 ${mode === "register" ? "font-bold border-b-2 border-teal-500" : "text-neutral-500"}`}>Register</button>
              </div>
              <label className="grid gap-1 text-sm font-medium">
                Email
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Password
                <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </label>
              {mode === "register" && (
                <label className="grid gap-1 text-sm font-medium">
                  Account type
                  <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </label>
              )}
              <button type="submit" className="rounded-lg bg-teal-400 py-2 text-sm font-semibold text-slate-900 hover:bg-teal-300">
                {mode === "login" ? "Sign in" : "Create account"}
              </button>
              {message && <p className="text-xs text-red-600">{message}</p>}
              <button type="button" onClick={() => setShowForm(false)} className="text-xs text-neutral-500 hover:underline">Cancel</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Header ---------- */

export function Header({ searchSlot }: { searchSlot?: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    async function loadCartCount() {
      const user = getStoredUser();
      if (user?.role !== "buyer") {
        setCartCount(0);
        return;
      }
      try {
        const items = await getCart();
        setCartCount(items.reduce((t, i) => t + i.quantity, 0));
      } catch {
        setCartCount(0);
      }
    }
    loadCartCount();
    window.addEventListener("auth-changed", loadCartCount);
    window.addEventListener("cart-changed", loadCartCount);
    return () => {
      window.removeEventListener("auth-changed", loadCartCount);
      window.removeEventListener("cart-changed", loadCartCount);
    };
  }, []);

  return (
    <header className="text-white">
      <div className="bg-slate-900">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-y-2 px-2 py-2 sm:px-3 lg:flex-nowrap">
          <Logo />

          <button type="button" className={`${control} hidden items-end gap-1 whitespace-nowrap text-left lg:flex`}>
            <PinIcon className="mb-0.5 h-5 w-5" />
            <span className="leading-tight">
              <span className="block text-xs text-slate-300">Delivering to India</span>
              <span className="block text-sm font-bold">Update location</span>
            </span>
          </button>

          {/* Search */}
          <div className="order-last w-full px-1 lg:order-none lg:w-auto lg:flex-1 lg:px-2">
            {searchSlot ?? <HeaderSearch />}
          </div>

          <div className="ml-auto flex items-center lg:ml-0">
            {/* Mobile sign-in link */}
            <Link href="/login" aria-label="Sign in" className={`${control} sm:hidden`}>
              <UserIcon className="h-6 w-6" />
            </Link>

            <AccountFlyout />

            <Link href="/orders" className={`${control} hidden whitespace-nowrap leading-tight md:block`}>
              <span className="block text-xs">Returns</span>
              <span className="block text-sm font-bold">&amp; Orders</span>
            </Link>

            <Link href="/cart" className={`${control} flex items-end gap-1`} aria-label={`Cart, ${cartCount} items`}>
              <span className="relative">
                <CartIcon className="h-9 w-9" />
                <span className="absolute -top-0.5 left-[55%] -translate-x-1/2 text-base font-extrabold leading-none text-teal-400">
                  {cartCount}
                </span>
              </span>
              <span className="mb-0.5 hidden text-sm font-bold sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      <SecondaryNav links={NAV_LINKS} onOpenMenu={() => setMenuOpen(true)} />
      <NavDrawer open={menuOpen} onClose={closeMenu} sections={DRAWER_SECTIONS} />
    </header>
  );
}
