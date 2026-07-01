import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getItem, getCategories, getProducts } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { collectLeaves } from "@/lib/utils";
import ProductDetail from "./ProductDetail";
import ProductGrid from "@/components/product/ProductGrid";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ path?: string; [key: string]: string | undefined }>;
};

async function ProductName({ slug }: { slug: string }) {
  const product = await getItem(slug);
  return <span className="text-ink">{product.name}</span>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getItem(slug).catch(() => null);
  const { name } = getBrand();
  return { title: product ? `${product.name} | ${name}` : name };
}

async function Detail({ slug, attrParams }: { slug: string; attrParams: Record<string, string> }) {
  const product = await getItem(slug);
  return <ProductDetail product={product} slug={slug} initialSelections={attrParams} />;
}

async function Related({ slug, categoryId }: { slug: string; categoryId: string }) {
  const res = await getProducts({ categoryId, size: 6 });
  const related = res.products.filter((p) => p.slug !== slug).slice(0, 5);
  if (related.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-16 lg:mt-24">
      <h2 className="text-[22px] font-normal mb-8">You may also like</h2>
      <ProductGrid products={related} />
    </section>
  );
}

export default async function ProductPage({ params, searchParams }: Props) {
  const [{ slug }, { path, ...attrParams }] = await Promise.all([params, searchParams]);

  const tree = await getCategories();
  const leaf = path ? collectLeaves(tree)[path] : null;
  return (
    <div className="pb-20 lg:pb-28">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pt-8 lg:pt-10">
        <nav className="flex items-center gap-2 text-[13px] text-grey-500">
          <Link href="/" className="hover:text-ink transition-colors duration-200">Home</Link>
          {leaf?.breadcrumbs.map((name, i) => {
            const isLast = i === leaf.breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-2">
                <span className="text-grey-300">/</span>
                {isLast
                  ? <Link href={`/category/${leaf.path}`} className="hover:text-ink transition-colors duration-200">{name}</Link>
                  : <span>{name}</span>
                }
              </span>
            );
          })}
          <span className="flex items-center gap-2">
            <span className="text-grey-300">/</span>
            <Suspense fallback={<span className="h-3 w-24 bg-grey-150 rounded-sm animate-pulse inline-block" />}>
              <ProductName slug={slug} />
            </Suspense>
          </span>
        </nav>
      </section>

      <Suspense fallback={<DetailSkeleton />}>
        <Detail slug={slug} attrParams={attrParams as Record<string, string>} />
      </Suspense>

      {leaf && (
        <Suspense fallback={<RelatedSkeleton />}>
          <Related slug={slug} categoryId={leaf.id} />
        </Suspense>
      )}
    </div>
  );
}

function RelatedSkeleton() {
  return (
    <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-16 lg:mt-24 animate-pulse">
      <div className="h-6 w-40 bg-grey-150 rounded-sm mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="aspect-[4/5] bg-grey-150" />
            <div className="mt-3 h-4 w-3/4 bg-grey-150 rounded-sm" />
            <div className="mt-2 h-3 w-1/3 bg-grey-150 rounded-sm" />
          </div>
        ))}
      </div>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-6 lg:mt-8 grid lg:grid-cols-[minmax(0,640px)_1fr] gap-10 lg:gap-16 items-start">
        <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[76px_1fr] gap-3 sm:gap-4">
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] bg-grey-150" />)}
          </div>
          <div className="aspect-[4/5] bg-grey-150" />
        </div>
        <div className="max-w-md space-y-4">
          <div className="h-3 w-16 bg-grey-150 rounded-sm" />
          <div className="h-8 w-3/4 bg-grey-150 rounded-sm" />
          <div className="h-8 w-1/2 bg-grey-150 rounded-sm" />
          <div className="h-5 w-16 bg-grey-150 rounded-sm" />
          <div className="pt-4 flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-9 w-24 bg-grey-150" />)}
          </div>
          <div className="flex gap-3 pt-4">
            <div className="flex-1 h-14 bg-grey-150" />
            <div className="w-14 h-14 bg-grey-150" />
          </div>
        </div>
      </section>
    </div>
  );
}
