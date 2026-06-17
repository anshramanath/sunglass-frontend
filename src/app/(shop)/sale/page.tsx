import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getSaleProducts } from "@/lib/api";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import LoadMoreSaleProducts from "@/components/product/LoadMoreSaleProducts";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `Sale | ${BRAND.name}` };

const FILTERS = [
  { label: "Under $15", slug: "under-15" },
  { label: "$15 – $25", slug: "15-25" },
  { label: "$25+",      slug: "25-plus" },
];

type Props = { searchParams: Promise<{ filter?: string }> };

async function SaleProducts({ filter }: { filter?: string }) {
  const data = await getSaleProducts({ brandSlug: BRAND_SLUG, filter, size: 20 });
  return (
    <LoadMoreSaleProducts
      initialProducts={data.products}
      initialHasNextPage={data.hasNextPage}
      filter={filter}
    />
  );
}

export default async function SalePage({ searchParams }: Props) {
  const { filter } = await searchParams;

  return (
    <div className="pb-20 lg:pb-28">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pt-8 lg:pt-10">
        <nav className="flex items-center gap-2 text-[13px] text-grey-500">
          <Link href="/" className="hover:text-ink transition-colors duration-200">Home</Link>
          <span className="flex items-center gap-2">
            <span className="text-grey-300">/</span>
            <span className="text-ink">Sale</span>
          </span>
        </nav>
      </section>

      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-7 lg:mt-9">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {FILTERS.map(({ label, slug }) => {
            const isActive = filter === slug;
            const href = isActive ? "/sale" : `/sale?filter=${slug}`;
            return (
              <Link
                key={slug}
                href={href}
                className={`shrink-0 whitespace-nowrap border transition-colors duration-200 h-9 px-4 text-[13px] flex items-center ${
                  isActive ? "border-ink bg-ink text-paper" : "border-grey-300 hover:border-ink text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-6">
        <Suspense key={filter ?? "all"} fallback={<LoadingSkeleton />}>
          <SaleProducts filter={filter} />
        </Suspense>
      </section>
    </div>
  );
}
