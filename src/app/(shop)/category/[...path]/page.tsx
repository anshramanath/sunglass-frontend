import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { collectLeaves } from "@/lib/utils";
import LoadMore from "./LoadMore";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

const FILTERS = [
  { label: "All",       slug: null },
  { label: "Under $15", slug: "under-15" },
  { label: "$15 – $25", slug: "15-25" },
  { label: "$25+",      slug: "25-plus" },
  { label: "Sale",      slug: "sale" },
];

type Props = {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<{ filter?: string }>;
};

async function ProductSection({ categoryId, filter }: { categoryId: string; filter?: string }) {
  const res = await getProducts({ categoryId, filter, size: 20 });
  
  return (
    <LoadMore
      initialProducts={res.products}
      initialHasNextPage={res.hasNextPage}
      categoryId={categoryId}
      filter={filter}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const tree = await getCategories();
  const leaf = collectLeaves(tree)[path.join("/")];
  const { name } = getBrand();
  return { title: `${leaf.name} | ${name}` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ path }, { filter }] = await Promise.all([params, searchParams]);
  
  const tree = await getCategories();
  const categoryPath = path.join("/");
  const leaf = collectLeaves(tree)[categoryPath];
  
  if (!leaf) notFound();

  return (
    <div className="pb-20 lg:pb-28">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pt-8 lg:pt-10">
        <nav className="flex items-center gap-2 text-[13px] text-grey-500">
          <Link href="/" className="hover:text-ink transition-colors duration-200">Home</Link>
          {leaf.breadcrumbs.map((name, i) => {
            const isLast = i === leaf.breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-2">
                <span className="text-grey-300">/</span>
                <span className={isLast ? "text-ink" : ""}>{name}</span>
              </span>
            );
          })}
        </nav>
      </section>

      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-7 lg:mt-9">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {FILTERS.map(({ label, slug }) => {
            const isActive = slug === null ? !filter : filter === slug;
            const href = slug === null || isActive ? `/category/${categoryPath}` : `/category/${categoryPath}?filter=${slug}`;
            return (
              <Link
                key={slug ?? "all"}
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
          <ProductSection categoryId={leaf.id} filter={filter} />
        </Suspense>
      </section>
    </div>
  );
}
