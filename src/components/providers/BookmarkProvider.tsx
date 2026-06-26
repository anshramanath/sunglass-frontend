"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { getBookmarks, putBookmarks } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { useLoggedIn } from "@/components/providers/AuthProvider";
import type { BookmarkedItem } from "@/lib/types";

const brandSlug = getBrand().slug;

export type { BookmarkedItem };

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
  for (const item of db) map.set(item.productSlug, item);
  return Array.from(map.values());
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const loggedIn = useLoggedIn();
  const [items, setItems] = useState<BookmarkedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function sync() {
      let localItems: BookmarkedItem[] = [];
      try {
        const stored = localStorage.getItem(`bookmarks:${brandSlug}`);
        if (stored) localItems = JSON.parse(stored);
      } catch {}

      if (loggedIn) {
        try {
          const dbItems = await getBookmarks();
          setItems(mergeBookmarks(localItems, dbItems));
          setLoaded(true);
          return;
        } catch {}
      }

      setItems(localItems);
      setLoaded(true);
    }
    sync();
  }, [loggedIn]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(`bookmarks:${brandSlug}`, JSON.stringify(items));
  }, [items, loaded]);

  useEffect(() => {
    if (!loaded || !loggedIn) return;
    const timeout = setTimeout(() => {
      putBookmarks(items).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [items, loaded, loggedIn]);

  const isBookmarked = useCallback((slug: string) =>
    items.some((i) => i.productSlug === slug), [items]);

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
