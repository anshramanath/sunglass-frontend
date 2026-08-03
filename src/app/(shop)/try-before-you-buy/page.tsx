import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getBrand } from "@/lib/brand";
import { getPackages } from "@/lib/api";
import TBYBClient from "./TBYBClient";

export function generateMetadata(): Metadata {
  return { title: `Try Before You Buy | ${getBrand().name}` };
}

function TBYBSkeleton() {
  return (
    <div className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-9 lg:mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-grey-200 p-6 flex flex-col">
            <div className="h-16 bg-grey-100 animate-pulse" />
            <div className="h-[18px] bg-grey-100 animate-pulse mt-4 w-3/4" />
            <div className="h-[13px] bg-grey-100 animate-pulse mt-2 w-1/3" />
            <div className="h-[26px] bg-grey-100 animate-pulse mt-5 w-1/2" />
            <div className="h-[46px] bg-grey-100 animate-pulse mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function TBYBLoader() {
  const [user, packages] = await Promise.all([getUser(), getPackages()]);
  return <TBYBClient packages={packages} email={user?.email ?? ""} name={user?.user_metadata?.name ?? ""} />;
}

export default function TBYBPage() {
  if (getBrand().slug !== "bikershades") notFound();

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
      <Suspense fallback={<TBYBSkeleton />}>
        <TBYBLoader />
      </Suspense>
    </div>
  );
}
