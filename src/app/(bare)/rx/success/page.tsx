"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getBrand } from "@/lib/brand";

const brand = getBrand();

export default function TBYBSuccessPage() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${brand.slug}:tbyb`);
      if (!stored) return;
      const data = JSON.parse(stored);
      data.packageId = null;
      localStorage.setItem(`${brand.slug}:tbyb`, JSON.stringify(data));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 grid place-items-center px-5 py-20">
        <div className="w-full max-w-[440px] text-center">

          <div className="mx-auto w-16 h-16 rounded-full bg-[#22963F] grid place-items-center">
            <svg className="w-8 h-8 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </div>

          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mt-7">Submission Confirmed</p>
          <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-3">Thank you for your submission</h1>
          <p className="text-[15px] text-grey-600 leading-relaxed mt-4">
            Your deposit was successful. Keep an eye on your submission in your account for updates.
          </p>

          <Link href="/account" className="inline-block bg-ink text-paper text-[15px] py-4 px-9 mt-9 hover:bg-grey-800 transition-colors duration-200">
            View My Account
          </Link>

        </div>
      </main>
    </div>
  );
}
