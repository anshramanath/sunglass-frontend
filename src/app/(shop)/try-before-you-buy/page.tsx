import Link from "next/link";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { getBrand } from "@/lib/brand";
import { getPackages } from "@/lib/api";
import TBYBClient from "./TBYBClient";

export function generateMetadata(): Metadata {
  return { title: `Try Before You Buy | ${getBrand().name}` };
}

export default async function TBYBPage() {
  const [user, packages] = await Promise.all([getUser(), getPackages()]);

  return (
    <div className="pb-20 lg:pb-28">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pt-8 lg:pt-10">
        <nav className="flex items-center gap-2 text-[13px] text-grey-500">
          <Link href="/" className="hover:text-ink transition-colors duration-200">Home</Link>
          <span className="flex items-center gap-2">
            <span className="text-grey-300">/</span>
            <span className="text-ink">Try Before You Buy</span>
          </span>
        </nav>
        <div className="mt-6 max-w-2xl">
          <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em]">Try Before You Buy</h1>
          <p className="text-[15px] text-grey-600 leading-relaxed mt-4">
            Pick a package, pay a fully-refundable deposit, and we'll send prescription frames to try at home. Return them and place your order — or get your deposit back, minus a service fee.
          </p>
        </div>
      </section>
      <TBYBClient packages={packages} userEmail={user?.email ?? undefined} />
    </div>
  );
}
