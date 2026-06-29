"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClearCart } from "@/components/providers/CartProvider";

export default function OrderSuccessPage() {
  const clear = useClearCart();
  const router = useRouter();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    clear();
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      router.push("/");
      return;
    }
    
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 grid place-items-center px-5 py-20">
        <div className="w-full max-w-[440px] text-center">

          <div className="mx-auto w-16 h-16 rounded-full bg-[#22963F] grid place-items-center">
            <svg className="w-8 h-8 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </div>

          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mt-7">Order Confirmed</p>
          <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-3">Thank you for your order</h1>
          <p className="text-[15px] text-grey-600 leading-relaxed mt-4">
            Your payment was successful. A confirmation and receipt are on their way to your email.
          </p>

          <p className="text-[13px] text-grey-500 mt-9">Redirecting in <span className="text-ink font-medium">{seconds}s</span>…</p>

        </div>
      </main>
    </div>
  );
}
