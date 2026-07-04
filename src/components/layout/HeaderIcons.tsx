"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartItems, useCartCount, useCartTotal, useRemoveFromCart, useIncrementQty, useDecrementQty } from "@/components/providers/CartProvider";
import { useBookmarkItems, useBookmarkCount, useToggleBookmark } from "@/components/providers/BookmarkProvider";
import { useLoggedIn } from "@/components/providers/AuthProvider";
import type { ProductListItem } from "@/lib/types";
import { searchProducts } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/shared/Sheet";
import { formatPrice } from "@/lib/utils";

type Panel = "search" | "saved" | "bag";

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function BagPanelContent() {
  const items = useCartItems();
  const remove = useRemoveFromCart();
  const increment = useIncrementQty();
  const decrement = useDecrementQty();
  const totalCents = useCartTotal();
  const count = useCartCount();

  return (
    <>
      <SheetTitle className="sr-only">My Bag</SheetTitle>
      <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-grey-200">
        <h2 className="text-[28px] font-normal">
          My Bag <span className="text-grey-400">({count})</span>
        </h2>
        <SheetClose className="grid place-items-center w-10 h-10 -mr-2 hover:opacity-60 transition-opacity duration-200">
          <CloseIcon />
        </SheetClose>
      </div>
      {items.length === 0 ? (
        <div className="flex-1 px-8 py-7">
          <p className="text-base text-grey-500 mt-4">Your bag is empty.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-8 py-7">
            <div className="divide-y divide-grey-150">
              {items.map((item) => {
                const attrParams = item.attribute.length > 0
                  ? "?" + item.attribute.map((a) => `${a.name}=${a.slug}`).join("&")
                  : "";
                const href = `/product/${item.productSlug}${attrParams}`;
                return (
                <div key={`${item.productSlug}:${item.sku}`} className="flex items-start gap-5 py-7 first:pt-0">
                  <SheetClose asChild>
                    <Link href={href} className="shrink-0 w-[90px] aspect-[4/5] bg-grey-100 flex items-center justify-center p-2">
                      <Image src={item.imageSrc} alt={item.name} width={90} height={112} className="w-full h-full object-contain mix-blend-multiply" />
                    </Link>
                  </SheetClose>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <SheetClose asChild>
                        <Link href={href} className="block text-[16px] font-medium leading-snug truncate">{item.name}</Link>
                      </SheetClose>
                      <button onClick={() => remove(item)} className="shrink-0 text-[13px] text-grey-400 hover:text-ink transition-colors duration-200">Remove</button>
                    </div>
                    {item.attribute.length > 0 && <p className="text-[14px] text-grey-500 mt-1 truncate">{item.attribute.map((a) => a.option).join(" / ")}</p>}
                    <div className="flex items-center justify-between mt-4">
                      <div className="inline-flex items-center border border-grey-300">
                        <button onClick={() => decrement(item)} disabled={item.quantity <= 1} className="w-9 h-9 grid place-items-center text-lg hover:bg-grey-100 transition-colors duration-200 disabled:opacity-30">&minus;</button>
                        <span className="w-9 text-center text-[15px]">{item.quantity}</span>
                        <button onClick={() => increment(item)} className="w-9 h-9 grid place-items-center text-lg hover:bg-grey-100 transition-colors duration-200">+</button>
                      </div>
                      <p className="text-[16px]">{formatPrice(item.priceCents * item.quantity)}</p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-grey-200 px-8 py-7">
            <div className="flex items-center justify-between text-[16px]">
              <span>Subtotal</span>
              <span>{formatPrice(totalCents)}</span>
            </div>
            <p className="text-[13px] text-grey-500 mt-1.5">Shipping &amp; taxes calculated at checkout.</p>
            <SheetClose asChild>
              <Link href="/checkout" className="block w-full bg-ink text-paper text-[15px] text-center py-4 mt-5 hover:bg-grey-800 transition-colors duration-200">
                Checkout
              </Link>
            </SheetClose>
          </div>
        </>
      )}
    </>
  );
}

function SavedPanelContent() {
  const items = useBookmarkItems();
  const count = useBookmarkCount();
  const toggle = useToggleBookmark();

  return (
    <>
      <SheetTitle className="sr-only">Saved</SheetTitle>
      <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-grey-200">
        <h2 className="text-[28px] font-normal">
          Saved <span className="text-grey-400">({count})</span>
        </h2>
        <SheetClose className="grid place-items-center w-10 h-10 -mr-2 hover:opacity-60 transition-opacity duration-200">
          <CloseIcon />
        </SheetClose>
      </div>
      <div className="px-8 py-8 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-base text-grey-500 mt-4">Nothing saved yet.</p>
        ) : (
          <div className="divide-y divide-grey-150">
            {items.map((item) => (
              <div key={item.productSlug} className="flex items-start gap-5 py-7 first:pt-0">
                <SheetClose asChild>
                  <Link href={`/product/${item.productSlug}`} className="shrink-0 w-[90px] aspect-[4/5] bg-grey-100 flex items-center justify-center p-2">
                    <Image src={item.imageSrc} alt={item.name} width={90} height={112} className="w-full h-full object-contain mix-blend-multiply" />
                  </Link>
                </SheetClose>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <SheetClose asChild>
                      <Link href={`/product/${item.productSlug}`} className="block text-[16px] font-medium leading-snug">{item.name}</Link>
                    </SheetClose>
                    <button onClick={() => toggle(item)} className="shrink-0 text-[13px] text-grey-400 hover:text-ink transition-colors duration-200">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SearchPanelContent({ featured }: { featured: ProductListItem[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); setNoResults(false); return; }
    setLoading(true);
    setNoResults(false);
    const timeout = setTimeout(async () => {
      try {
        const items = await searchProducts(query);
        setResults(items);
        setNoResults(items.length === 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const displayed = query.trim() ? results : featured;

  return (
    <>
      <SheetTitle className="sr-only">Search</SheetTitle>
      <div className="flex items-center gap-4 px-8 pt-8">
        <div className="flex items-center gap-3 flex-1 border-b border-ink pb-3">
          <svg className="w-5 h-5 text-ink shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="bg-transparent text-lg tracking-wide uppercase placeholder-grey-400 outline-none w-full" autoFocus />
        </div>
        <SheetClose className="grid place-items-center w-10 h-10 -mr-2 hover:opacity-60 transition-opacity duration-200">
          <CloseIcon />
        </SheetClose>
      </div>
      <div className="px-8 py-9 overflow-y-auto">
        <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mb-6">Find Your Match</p>
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="bg-grey-100 aspect-[4/5] animate-pulse" />
                <div className="mt-2 h-4 bg-grey-100 animate-pulse rounded w-3/4" />
                <div className="mt-1.5 h-4 bg-grey-100 animate-pulse rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : noResults ? (
          <p className="text-base text-grey-500">No results for &ldquo;{query}&rdquo;</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7">
            {displayed.map((p) => (
              <SheetClose key={p.id} asChild>
                <Link href={`/product/${p.slug}`} className="block">
                  <div className="relative bg-grey-100 aspect-[4/5] flex items-center justify-center p-4">
                    <Image src={p.imageSrc} alt={p.name} width={200} height={200} className="w-full h-full object-contain mix-blend-multiply" />
                    {p.sale && (
                      <span className="absolute top-2 right-2 text-paper text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5" style={{ backgroundColor: "var(--color-brand)" }}>Sale</span>
                    )}
                    {p.featured && (
                      <span className="absolute top-2 left-2 whitespace-nowrap bg-paper/90 text-ink border border-grey-200 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5">Best Seller</span>
                    )}
                  </div>
                  <p className="mt-2 text-[15px]">{p.name}</p>
                  <p className="text-[15px] text-grey-600">
                    {p.sale && !p.variations.length ? (
                      <>
                        <span className="line-through mr-1.5">{formatPrice(p.minPriceCents)}</span>
                        <span style={{ color: "var(--color-brand)" }}>{formatPrice(p.salePriceCents!)}</span>
                      </>
                    ) : p.minPriceCents === p.maxPriceCents ? (
                      formatPrice(p.minPriceCents)
                    ) : (
                      `${formatPrice(p.minPriceCents)} – ${formatPrice(p.maxPriceCents)}`
                    )}
                  </p>
                </Link>
              </SheetClose>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function HeaderIcons({ isSignedIn, featured }: { isSignedIn: boolean; featured: ProductListItem[] }) {
  const [openPanel, setOpenPanel] = useState<Panel | null>(null);
  const loggedIn = useLoggedIn();
  const cartCount = useCartCount();
  const bookmarkCount = useBookmarkCount();
  const isActuallySignedIn = isSignedIn && loggedIn;

  return (
    <>
      <div className="ml-auto flex items-center gap-4 sm:gap-5">
        <button onClick={() => setOpenPanel("search")} className="grid place-items-center hover:opacity-60 transition-opacity duration-200" aria-label="Search">
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        <button onClick={() => setOpenPanel("saved")} className="relative grid place-items-center hover:opacity-60 transition-opacity duration-200" aria-label="Saved">
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {bookmarkCount > 0 && (
            <span key={bookmarkCount} className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-paper text-[10px] grid place-items-center animate-badge-pop" style={{ backgroundColor: "var(--color-brand)" }}>{bookmarkCount}</span>
          )}
        </button>

        <button onClick={() => setOpenPanel("bag")} className="relative grid place-items-center hover:opacity-60 transition-opacity duration-200" aria-label="Bag">
          <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cartCount > 0 && (
            <span key={cartCount} className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-paper text-[10px] grid place-items-center animate-badge-pop" style={{ backgroundColor: "var(--color-brand)" }}>{cartCount}</span>
          )}
        </button>

        {isActuallySignedIn ? (
          <Link href="/account" className="grid place-items-center hover:opacity-60 transition-opacity duration-200" aria-label="Account">
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </Link>
        ) : (
          <Link href="/signin" className="whitespace-nowrap text-[15px] hover:opacity-60 transition-opacity duration-200">Sign In</Link>
        )}
      </div>

      <Sheet open={openPanel === "search"} onOpenChange={(o) => !o && setOpenPanel(null)}>
        <SheetContent aria-describedby={undefined}><SearchPanelContent featured={featured} /></SheetContent>
      </Sheet>
      <Sheet open={openPanel === "saved"} onOpenChange={(o) => !o && setOpenPanel(null)}>
        <SheetContent aria-describedby={undefined}><SavedPanelContent /></SheetContent>
      </Sheet>
      <Sheet open={openPanel === "bag"} onOpenChange={(o) => !o && setOpenPanel(null)}>
        <SheetContent aria-describedby={undefined}><BagPanelContent /></SheetContent>
      </Sheet>
    </>
  );
}
