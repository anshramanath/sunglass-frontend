"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { BRAND } from "@/lib/brand";

export default function OrderSuccessPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-grey-200">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-10">
          <div className="h-16 flex items-center justify-center">
            <Link href="/" aria-label={`${BRAND.name} home`}>
              <Image src={BRAND.logo} alt={BRAND.name} width={120} height={28} className="h-8 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-5 py-20">
        <div className="w-full max-w-[440px] text-center">

          <div className="mx-auto w-16 h-16 rounded-full bg-ink grid place-items-center">
            <svg className="w-8 h-8 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </div>

          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mt-7">Order Confirmed</p>
          <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-3">Thank you for your order</h1>
          <p className="text-[15px] text-grey-600 leading-relaxed mt-4">
            Your payment was successful. A confirmation and receipt are on their way to your email.
          </p>

          <div className="flex flex-col gap-3 mt-9">
            <Link href="/account" className="bg-ink text-paper text-[15px] py-4 block hover:bg-grey-800 transition-colors duration-200">
              View Order
            </Link>
            <Link href="/" className="border border-ink text-[15px] py-4 block hover:bg-ink hover:text-paper transition-colors duration-200">
              Continue Shopping
            </Link>
          </div>

          <p className="text-[13px] text-grey-500 leading-relaxed mt-8">
            Questions about your order?{" "}
            <a href="#" className="underline underline-offset-4 hover:text-ink transition-colors duration-200">
              Contact support
            </a>
          </p>

        </div>
      </main>
    </div>
  );
}
