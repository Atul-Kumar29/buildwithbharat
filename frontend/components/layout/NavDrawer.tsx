"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRightIcon, CloseIcon, UserIcon } from "@/components/ui/Icons";

export interface LinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  sections: LinkGroup[];
}

export function NavDrawer({ open, onClose, sections }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "visible" : "invisible transition-[visibility] delay-200"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Browse menu"
        className={`absolute inset-y-0 left-0 flex w-[365px] max-w-[85vw] flex-col bg-white text-neutral-900 shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 bg-slate-800 px-5 text-lg font-bold text-white">
          <UserIcon className="h-6 w-6" />
          <span>Hello, sign in</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto rounded p-1 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pb-6">
          {sections.map((section) => (
            <div key={section.title} className="border-b border-neutral-200 py-2 last:border-0">
              <h3 className="px-6 pb-1 pt-3 text-lg font-bold">{section.title}</h3>
              <ul>
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-6 py-3 text-sm hover:bg-neutral-100"
                    >
                      {link.label}
                      <ChevronRightIcon className="h-4 w-4 text-neutral-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
