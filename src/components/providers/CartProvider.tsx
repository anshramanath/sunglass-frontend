"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCart, putCart } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { useLoggedIn, useSetLoggedIn } from "@/components/providers/AuthProvider";
import type { CartItem } from "@/lib/types";

const brandSlug = getBrand().slug;

type CartContextValue = {
  items: Map<string, CartItem>;
  setItems: React.Dispatch<React.SetStateAction<Map<string, CartItem>>>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function itemKey(slug: string, sku: string) {
  return `${slug}:${sku}`;
}

function mergeCartItems(local: CartItem[], db: CartItem[]): Map<string, CartItem> {
  const map = new Map<string, CartItem>();
  for (const item of local) map.set(itemKey(item.productSlug, item.sku), item);
  for (const item of db) map.set(itemKey(item.productSlug, item.sku), item);
  return map;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const loggedIn = useLoggedIn();
  const setLoggedIn = useSetLoggedIn();
  const [items, setItems] = useState<Map<string, CartItem>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function sync() {
      let localItems: CartItem[] = [];
      try {
        const stored = localStorage.getItem(`${brandSlug}:cart`);
        if (stored) localItems = JSON.parse(stored);
      } catch {}

      let dbItems: CartItem[] = [];
      if (loggedIn) {
        try { dbItems = await getCart(); } catch (e) {
          if (e instanceof Error && e.message === "Unauthorized") setLoggedIn(false);
        }
      }

      setItems(mergeCartItems(localItems, dbItems));
      setLoaded(true);
    }

    sync();
  }, [loggedIn]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(`${brandSlug}:cart`, JSON.stringify([...items.values()]));
  }, [items]);

  useEffect(() => {
    if (!loaded || !loggedIn) return;

    const timeout = setTimeout(() => {
      putCart([...items.values()]).catch(() => {});
    }, 800);
    
    return () => clearTimeout(timeout);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, setItems }}>
      {children}
    </CartContext.Provider>
  );
}

function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("Cart hooks must be used within CartProvider");
  return ctx;
}

export function useCartItems() {
  return [...useCartContext().items.values()];
}

export function useCartCount() {
  let count = 0;
  for (const item of useCartContext().items.values()) count += item.quantity;
  return count;
}

export function useCartTotal() {
  let total = 0;
  for (const item of useCartContext().items.values()) total += item.priceCents * item.quantity;
  return total;
}

export function useAddToCart() {
  const { setItems } = useCartContext();
  return (item: Omit<CartItem, "quantity">) => setItems((prev) => {
    const key = itemKey(item.productSlug, item.sku);
    const next = new Map(prev);
    const existing = next.get(key);
    if (existing) {
      next.set(key, { ...existing, quantity: existing.quantity + 1 });
    } else {
      next.set(key, {
        productId: item.productId,
        productSlug: item.productSlug,
        sku: item.sku,
        attribute: item.attribute,
        name: item.name,
        imageSrc: item.imageSrc,
        priceCents: item.priceCents,
        quantity: 1,
      });
    }
    return next;
  });
}

export function useRemoveFromCart() {
  const { setItems } = useCartContext();
  return (item: CartItem) => setItems((prev) => {
    const next = new Map(prev);
    next.delete(itemKey(item.productSlug, item.sku));
    return next;
  });
}

export function useIncrementQty() {
  const { setItems } = useCartContext();
  return (item: CartItem) => setItems((prev) => {
    const key = itemKey(item.productSlug, item.sku);
    const existing = prev.get(key);
    if (!existing) return prev;
    const next = new Map(prev);
    next.set(key, { ...existing, quantity: existing.quantity + 1 });
    return next;
  });
}

export function useDecrementQty() {
  const { setItems } = useCartContext();
  return (item: CartItem) => setItems((prev) => {
    const key = itemKey(item.productSlug, item.sku);
    const existing = prev.get(key);
    if (!existing || existing.quantity <= 1) return prev;
    const next = new Map(prev);
    next.set(key, { ...existing, quantity: existing.quantity - 1 });
    return next;
  });
}

export function useClearCart() {
  const { setItems } = useCartContext();
  return () => setItems(new Map());
}
