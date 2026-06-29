"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartItems, useCartTotal, useCartCount, useRemoveFromCart, useIncrementQty, useDecrementQty, useUpdateCartPrice } from "@/components/providers/CartProvider";
import { validateCart, createCheckoutSession } from "@/lib/api";
import { getBrand } from "@/lib/brand";

const brand = getBrand();

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="11" width="16" height="9" rx="1" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export default function CheckoutPage() {
  const items = useCartItems();
  const totalCents = useCartTotal();
  const count = useCartCount();
  const remove = useRemoveFromCart();
  const updatePrice = useUpdateCartPrice();
  const increment = useIncrementQty();
  const decrement = useDecrementQty();
  const [redirecting, setRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  function applyValidation(data: { productSlug: string; sku: string; exists: boolean; priceCents: number | null; priceChanged: boolean }[]) {
    setCheckoutError(null);

    let removed = 0;
    let updated = 0;
    for (const validated of data) {
      const cartItem = items.find((i) => i.productSlug === validated.productSlug && i.sku === validated.sku)!;
      if (!validated.exists) {
        remove(cartItem);
        removed++;
      } else if (validated.priceChanged) {
        updatePrice(cartItem, validated.priceCents!);
        updated++;
      }
    }
    
    const parts: string[] = [];
    if (removed > 0) parts.push(`${removed} item${removed > 1 ? "s" : ""} removed`);
    if (updated > 0) parts.push(`${updated} item price${updated > 1 ? "s" : ""} updated`);
    if (parts.length > 0) setCheckoutError(parts.join(" · "));
  }

  useEffect(() => {
    const validateItems = items.map((i) => ({ productSlug: i.productSlug, sku: i.sku, priceCents: i.priceCents }));

    if (validateItems.length === 0) return;

    async function validate() {
      try {
        const result = await validateCart(validateItems);
        applyValidation(result.data);
      } catch {}
    }

    validate();
  }, []);

  async function handleProceed() {
    if (items.length === 0) return;
    setRedirecting(true);
    const res = await createCheckoutSession(
      items.map((i) => ({ productSlug: i.productSlug, sku: i.sku, priceCents: i.priceCents, quantity: i.quantity })),
      `${window.location.origin}/order/success`,
      `${window.location.origin}/order/failure`,
    );
    if ("data" in res) {
      applyValidation(res.data);
      setRedirecting(false);
      return;
    }
    window.location.href = res.url;
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="border-b border-grey-200">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-10">
          <div className="h-16 flex items-center justify-between relative">
            <Link href="/" className="shrink-0" aria-label={`${brand.name} home`}>
              <Image src={brand.logo} alt={brand.name} width={120} height={28} className="h-8" style={{ width: "auto" }} />
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[13px] text-grey-500 whitespace-nowrap">
              <LockIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Secure Checkout</span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-1.5 whitespace-nowrap text-[13px] hover:opacity-60 transition-opacity duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Bag
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-[1100px] px-5 lg:px-10 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-start">

          {/* Left — heading + items */}
          <div>
            <h1 className="text-[26px] lg:text-[34px] font-normal tracking-[-0.01em]">Review your order</h1>
            <p className="text-[15px] text-grey-600 mt-2.5 leading-relaxed">
              Confirm your items below. You&apos;ll enter your email, shipping address and payment on the next step — a secure page hosted by Stripe.
            </p>

            <div className="flex items-baseline justify-between border-b border-grey-200 pb-4 mt-8">
              <h2 className="text-[21px] font-normal">Your Items</h2>
              <span className="text-[13px] text-grey-500 whitespace-nowrap">{count} {count === 1 ? "item" : "items"}</span>
            </div>

            <div className="divide-y divide-grey-150">
              {items.length === 0 ? (
                <p className="text-[15px] text-grey-500 py-6">Your bag is empty.</p>
              ) : (
                items.map((item) => (
                  <div key={`${item.productSlug}:${item.sku}`} className="flex gap-5 py-6">
                    <Link href={`/product/${item.productSlug}`} className="block w-20 shrink-0 self-start bg-grey-100 aspect-[4/5] overflow-hidden flex items-center justify-center p-2">
                      <Image src={item.imageSrc} alt={item.name} width={80} height={100} className="w-full h-full object-contain mix-blend-multiply" />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <Link href={`/product/${item.productSlug}`} className="block text-[15px] truncate hover:opacity-60 transition-opacity duration-200">{item.name}</Link>
                        <button onClick={() => remove(item)} className="shrink-0 text-[13px] text-grey-400 hover:text-ink transition-colors duration-200">Remove</button>
                      </div>
                      {item.attribute.length > 0 && <p className="text-[13px] text-grey-500 mt-0.5 truncate">{item.attribute.map((a) => a.option).join(" / ")}</p>}
                      <div className="flex items-center justify-between mt-4">
                        <div className="inline-flex items-center border border-grey-300">
                          <button onClick={() => decrement(item)} disabled={item.quantity <= 1} className="w-8 h-8 grid place-items-center text-grey-600 hover:bg-grey-100 transition-colors duration-200 disabled:opacity-30">&minus;</button>
                          <span className="w-9 text-center text-[15px] tabular-nums">{item.quantity}</span>
                          <button onClick={() => increment(item)} className="w-8 h-8 grid place-items-center text-grey-600 hover:bg-grey-100 transition-colors duration-200">+</button>
                        </div>
                        <p className="text-[15px]">{fmt(item.priceCents * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right — sticky summary */}
          <aside className="lg:sticky lg:top-8 bg-grey-50 p-7 lg:p-8">
            <h2 className="text-[21px] font-normal">Order Summary</h2>

            <div className="mt-6 flex items-center gap-2.5 text-[15px] border-b border-grey-200 pb-6">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M1 4h14v11H1z" /><path d="M15 8h4l4 4v3h-8z" />
                <circle cx="6" cy="18.5" r="2" /><circle cx="18.5" cy="18.5" r="2" />
              </svg>
              <span>Standard Shipping · 2–4 business days</span>
              <span className="ml-auto">Free</span>
            </div>

            <dl className="mt-6 space-y-2.5 text-[15px]">
              <div className="flex justify-between"><dt className="text-grey-600">Subtotal</dt><dd>{fmt(totalCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-grey-600">Shipping</dt><dd>Free</dd></div>
              <div className="flex justify-between"><dt className="text-grey-600">Tax</dt><dd className="text-grey-500">Calculated at payment</dd></div>
            </dl>

            <div className="flex justify-between items-baseline mt-5 pt-5 border-t border-grey-200">
              <span className="text-[15px]">Order Total</span>
              <span className="text-[21px]">{fmt(totalCents)}</span>
            </div>
            <p className="text-[13px] text-grey-500 mt-2.5">Applicable tax is calculated and shown on the next step.</p>

            {checkoutError && <p className="text-[13px] text-brand mt-5 text-center">{checkoutError}</p>}
            <button
              type="button"
              onClick={handleProceed}
              disabled={redirecting || items.length === 0}
              className="w-full bg-ink text-paper text-[15px] py-4 mt-7 flex items-center justify-center gap-2.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50"
            >
              <LockIcon className="w-[18px] h-[18px]" />
              Proceed to Payment
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {["Visa", "Mastercard", "Amex", "Apple Pay", "G Pay"].map((method) => (
                <span key={method} className="border border-grey-200 text-[11px] uppercase tracking-wide text-grey-500 px-2 py-1">{method}</span>
              ))}
            </div>

            <p className="flex items-center justify-center gap-1.5 text-[13px] text-grey-400 mt-4">
              <LockIcon className="w-3.5 h-3.5" />
              Powered by <span className="text-grey-600 font-medium">Stripe</span>
            </p>
          </aside>

        </div>
      </main>

      {/* Stripe redirect overlay */}
      {redirecting && (
        <div className="fixed inset-0 z-50 bg-paper/95 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
          <div className="w-9 h-9 border-2 border-grey-200 border-t-ink rounded-full animate-spin" />
          <p className="text-[15px] text-grey-600">Redirecting to secure checkout…</p>
          <p className="flex items-center gap-1.5 text-[13px] text-grey-400">
            <LockIcon className="w-3.5 h-3.5" />
            Powered by <span className="text-grey-600 font-medium">Stripe</span>
          </p>
        </div>
      )}

    </div>
  );
}
