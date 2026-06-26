"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
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
  for (const item of db) map.set(itemKey(item.productSlug, item.sku), item);
  return Array.from(map.values());
}

export function CartProvider({ brandSlug, children }: { brandSlug: string; children: ReactNode }) {
  const loggedIn = useLoggedIn();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function sync() {
      let localItems: CartItem[] = [];
      try {
        const stored = localStorage.getItem(`cart:${brandSlug}`);
        if (stored) localItems = JSON.parse(stored);
      } catch {}

      if (loggedIn) {
        try {
          const dbItems = await getCart();
          setItems(mergeCartItems(localItems, dbItems));
          setLoaded(true);
          return;
        } catch {}
      }

      setItems(localItems);
      setLoaded(true);
    }
    sync();
  }, [loggedIn, brandSlug]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(`cart:${brandSlug}`, JSON.stringify(items));
  }, [items, loaded, brandSlug]);

  useEffect(() => {
    if (!loaded || !loggedIn) return;
    const timeout = setTimeout(() => {
      putCart(items).catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, [items, loaded, loggedIn]);

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
