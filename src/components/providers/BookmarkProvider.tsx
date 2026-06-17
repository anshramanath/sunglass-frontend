"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { BRAND_SLUG } from "@/lib/brand";
import { getBookmarks, putBookmarks } from "@/lib/api";
import { useLoggedIn } from "@/components/providers/AuthProvider";
import type { CartAttribute } from "@/components/providers/CartProvider";

export type BookmarkedItem = {
  productSlug: string;
  attribute: CartAttribute[];
  name: string;
  imageSrc: string;
};

type BookmarkContextValue = {
  items: BookmarkedItem[];
  toggle: (item: BookmarkedItem) => void;
  isBookmarked: (slug: string) => boolean;
  remove: (slug: string) => void;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

function mergeBookmarks(local: BookmarkedItem[], db: BookmarkedItem[]): BookmarkedItem[] {
  const map = new Map<string, BookmarkedItem>();
  for (const item of local) map.set(item.productSlug, item);
  for (const item of db) map.set(item.productSlug, item); // DB wins on conflict
  return Array.from(map.values());
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const loggedIn = useLoggedIn();
  const [items, setItems] = useState<BookmarkedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load localStorage, merge with DB, set items
  useEffect(() => {
    async function sync() {
      let localItems: BookmarkedItem[] = [];
      try {
        const stored = localStorage.getItem(`bookmarks:${BRAND_SLUG}`);
        if (stored) localItems = JSON.parse(stored);
      } catch {}

      try {
        const dbItems = await getBookmarks(BRAND_SLUG);
        if (dbItems) {
          setItems(mergeBookmarks(localItems, dbItems));
          setLoaded(true);
          return;
        }
      } catch {}

      setItems(localItems);
      setLoaded(true);
    }
    sync();
  }, [loggedIn]);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(`bookmarks:${BRAND_SLUG}`, JSON.stringify(items));
  }, [items, loaded]);

  // Debounced DB sync
  useEffect(() => {
    if (!loaded) return;
    const timeout = setTimeout(() => {
      putBookmarks(BRAND_SLUG, items).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [items, loaded]);

  const isBookmarked = useCallback((slug: string) => items.some((i) => i.productSlug === slug), [items]);

  const toggle = useCallback((item: BookmarkedItem) => {
    setItems((prev) =>
      prev.some((i) => i.productSlug === item.productSlug)
        ? prev.filter((i) => i.productSlug !== item.productSlug)
        : [...prev, item]
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.productSlug !== slug));
  }, []);

  return (
    <BookmarkContext.Provider value={{ items, toggle, isBookmarked, remove }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}
