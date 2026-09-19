"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

/** Tracks whether a horizontal scroller can move left/right and provides paging. */
export function useScrollArrows<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [ref, update]);

  const scrollByPage = useCallback(
    (dir: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
    },
    [ref],
  );

  return { canPrev, canNext, scrollByPage };
}
