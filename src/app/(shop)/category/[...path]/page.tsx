import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { findPathNodes } from "@/lib/categoryUtils";
import LoadMoreProducts from "@/components/product/LoadMoreProducts";
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

async function ProductSection({ categoryId, filter, categoryPath }: { categoryId: string; filter?: string; categoryPath: string }) {
  const data = await getProducts({ brandSlug: BRAND_SLUG, categoryId, filter, size: 20 });
  return (
    <LoadMoreProducts
      initialProducts={data.products}
      initialHasNextPage={data.hasNextPage}
      categoryId={categoryId}
      filter={filter}
      categoryPath={categoryPath}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const tree = await getCategories(BRAND_SLUG);
  const nodes = findPathNodes(tree, path);
  const leaf = nodes?.[nodes.length - 1];
  return { title: leaf ? `${leaf.name} | ${BRAND.name}` : BRAND.name };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { path } = await params;
  const { filter } = await searchParams;
  const tree = await getCategories(BRAND_SLUG);
  const nodes = findPathNodes(tree, path);
  if (!nodes) notFound();

  const leaf = nodes[nodes.length - 1];
  const categoryPath = path.join("/");

  return (
    <div className="pb-20 lg:pb-28">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pt-8 lg:pt-10">
        <nav className="flex items-center gap-2 text-[13px] text-grey-500">
          <Link href="/" className="hover:text-ink transition-colors duration-200">Home</Link>
          {nodes.map((node, i) => {
            const isLast = i === nodes.length - 1;
            return (
              <span key={node.id} className="flex items-center gap-2">
                <span className="text-grey-300">/</span>
                <span className={isLast ? "text-ink" : ""}>{node.name}</span>
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
          <ProductSection categoryId={leaf.id} filter={filter} categoryPath={categoryPath} />
        </Suspense>
      </section>
    </div>
  );
}
