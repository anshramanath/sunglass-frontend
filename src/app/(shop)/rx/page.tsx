import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getBrand } from "@/lib/brand";
import { getPackages, getPrescriptions } from "@/lib/api";
import TBYBClient from "./TBYBClient";
import PrescriptionFramesClient from "./PrescriptionFramesClient";

export function generateMetadata(): Metadata {
  return { title: `Rx | ${getBrand().name}` };
}

function PackagesSkeleton() {
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

function FramesSkeleton() {
  return (
    <div className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-9 lg:mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-grey-200 p-6 flex flex-col">
            <div className="h-40 bg-grey-100 animate-pulse" />
            <div className="h-[18px] bg-grey-100 animate-pulse mt-4 w-3/4" />
            <div className="h-[13px] bg-grey-100 animate-pulse mt-3 w-1/4" />
            <div className="h-[13px] bg-grey-100 animate-pulse mt-1.5 w-1/3" />
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

async function FramesLoader() {
  const [user, frames] = await Promise.all([getUser(), getPrescriptions()]);
  return <PrescriptionFramesClient frames={frames} email={user?.email ?? ""} name={user?.user_metadata?.name ?? ""} />;
}

type Props = { searchParams: Promise<{ tab?: string }> };

const TBYB_DESC = "Pick a package and pay a deposit — we'll handpick frames based on your preferences and send them to your door. Try them at home, then return within 5 days and apply your deposit toward your order, or get it back minus a $30 service fee.";
const FRAMES_DESC = "Already know what you want? Pick a frame, choose your color, and we'll build your lenses to your exact prescription.";

export default async function RxPage({ searchParams }: Props) {
  if (getBrand().slug !== "bikershades") notFound();

  const { tab } = await searchParams;
  const activeTab = tab === "frames" ? "frames" : "tbyb";

  const tabClass = (t: string) =>
    `pb-3.5 text-[18px] border-b-2 -mb-px transition-colors duration-200 ${activeTab === t ? "border-ink text-ink" : "border-transparent text-grey-500 hover:text-ink"}`;

  return (
    <div className="pb-20 lg:pb-28">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pt-8 lg:pt-10">
        <nav className="flex items-center gap-2 text-[13px] text-grey-500">
          <Link href="/" className="hover:text-ink transition-colors duration-200">Home</Link>
          <span className="flex items-center gap-2">
            <span className="text-grey-300">/</span>
            <span className="text-ink">Rx</span>
          </span>
        </nav>

        <div className="flex items-center gap-8 mt-7 border-b border-grey-200">
          <Link href="/rx" className={tabClass("tbyb")}>Try Before You Buy</Link>
          <Link href="/rx?tab=frames" className={tabClass("frames")}>Prescription Frames</Link>
        </div>

        <p className="text-[15px] text-grey-600 leading-relaxed mt-6 max-w-2xl">
          {activeTab === "tbyb" ? TBYB_DESC : FRAMES_DESC}
        </p>
      </section>

      {activeTab === "tbyb" ? (
        <Suspense fallback={<PackagesSkeleton />}>
          <TBYBLoader />
        </Suspense>
      ) : (
        <Suspense fallback={<FramesSkeleton />}>
          <FramesLoader />
        </Suspense>
      )}
    </div>
  );
}
