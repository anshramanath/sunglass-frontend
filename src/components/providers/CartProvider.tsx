"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { BRAND_SLUG } from "@/lib/brand";
import { getCart, putCart } from "@/lib/api";
import { useLoggedIn } from "@/components/providers/AuthProvider";
import type { CartItem } from "@/lib/types";

export type { CartItem };

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (productSlug: string, sku: string) => void;
  updateQty: (productSlug: string, sku: string, qty: number) => void;
  clear: () => void;
  totalCents: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function itemKey(slug: string, sku: string) {
  return `${slug}:${sku}`;
}

function mergeCartItems(local: CartItem[], db: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of local) map.set(itemKey(item.productSlug, item.sku), item);
  for (const item of db) map.set(itemKey(item.productSlug, item.sku), item); // DB wins on conflict
  return Array.from(map.values());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const loggedIn = useLoggedIn();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load localStorage, merge with DB, set items
  useEffect(() => {
    async function sync() {
      let localItems: CartItem[] = [];
      try {
        const stored = localStorage.getItem(`cart:${BRAND_SLUG}`);
        if (stored) localItems = JSON.parse(stored);
      } catch {}

      try {
        const res = await getCart(BRAND_SLUG);
        if (res.success) {
          setItems(mergeCartItems(localItems, res.data));
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
    localStorage.setItem(`cart:${BRAND_SLUG}`, JSON.stringify(items));
  }, [items, loaded]);

  // Debounced DB sync
  useEffect(() => {
    if (!loaded) return;
    const timeout = setTimeout(() => {
      putCart(BRAND_SLUG, items).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const key = itemKey(item.productSlug, item.sku);
      const existing = prev.find((i) => itemKey(i.productSlug, i.sku) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productSlug, i.sku) === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const remove = useCallback((productSlug: string, sku: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i.productSlug, i.sku) !== itemKey(productSlug, sku)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const updateQty = useCallback((productSlug: string, sku: string, qty: number) => {
    if (qty <= 0) { remove(productSlug, sku); return; }
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.productSlug, i.sku) === itemKey(productSlug, sku) ? { ...i, quantity: qty } : i
      )
    );
  }, [remove]);

  const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, totalCents, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
