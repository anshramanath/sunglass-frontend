"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getBookmarks, putBookmarks } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { useLoggedIn, useSetLoggedIn } from "@/components/providers/AuthProvider";
import type { BookmarkedItem } from "@/lib/types";

const brandSlug = getBrand().slug;

type BookmarkContextValue = {
  items: Map<string, BookmarkedItem>;
  setItems: React.Dispatch<React.SetStateAction<Map<string, BookmarkedItem>>>;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

function mergeBookmarks(local: BookmarkedItem[], db: BookmarkedItem[]): Map<string, BookmarkedItem> {
  const map = new Map<string, BookmarkedItem>();
  for (const item of local) map.set(item.productSlug, item);
  for (const item of db) map.set(item.productSlug, item);
  return map;
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const loggedIn = useLoggedIn();
  const setLoggedIn = useSetLoggedIn();
  const [items, setItems] = useState<Map<string, BookmarkedItem>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function sync() {
      let localItems: BookmarkedItem[] = [];
      try {
        const stored = localStorage.getItem(`${brandSlug}:bookmarks`);
        if (stored) localItems = JSON.parse(stored);
      } catch {}

      let dbItems: BookmarkedItem[] = [];
      if (loggedIn) {
        try { dbItems = await getBookmarks(); } catch (e) {
          if (e instanceof Error && e.message === "Unauthorized") setLoggedIn(false);
        }
      }

      setItems(mergeBookmarks(localItems, dbItems));
      setLoaded(true);
    }

    sync();
  }, [loggedIn]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(`${brandSlug}:bookmarks`, JSON.stringify([...items.values()]));
  }, [items]);

  useEffect(() => {
    if (!loaded || !loggedIn) return;

    const timeout = setTimeout(() => {
      putBookmarks([...items.values()]).catch((e) => {
        if (e instanceof Error && e.message === "Unauthorized") setLoggedIn(false);
      });
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [items]);

  return (
    <BookmarkContext.Provider value={{ items, setItems }}>
      {children}
    </BookmarkContext.Provider>
  );
}

function useBookmarkContext() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("Bookmark hooks must be used within BookmarkProvider");
  return ctx;
}

export function useBookmarkItems() {
  return [...useBookmarkContext().items.values()];
}

export function useBookmarkCount() {
  return useBookmarkContext().items.size;
}

export function useIsBookmarked(item: { slug: string }) {
  return useBookmarkContext().items.has(item.slug);
}

export function useToggleBookmark() {
  const { setItems } = useBookmarkContext();
  return (item: BookmarkedItem) => setItems((prev) => {
    const next = new Map(prev);
    if (next.has(item.productSlug)) {
      next.delete(item.productSlug);
    } else {
      next.set(item.productSlug, {
        productId: item.productId,
        productSlug: item.productSlug,
        name: item.name,
        imageSrc: item.imageSrc,
      });
    }
    return next;
  });
}

