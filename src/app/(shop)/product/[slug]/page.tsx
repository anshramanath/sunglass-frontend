import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getItem, getCategories, getProducts } from "@/lib/api";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { findPathNodes } from "@/lib/categoryUtils";
import ProductDetail from "@/components/product/ProductDetail";
import ProductGrid from "@/components/product/ProductGrid";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ path?: string; [key: string]: string | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getItem(slug, BRAND_SLUG).catch(() => null);
  return { title: product ? `${product.name} | ${BRAND.name}` : BRAND.name };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const [{ slug }, { path, ...attrParams }] = await Promise.all([params, searchParams]);
  const product = await getItem(slug, BRAND_SLUG).catch(() => null);
  if (!product) notFound();

  const categoryNodes = path
    ? findPathNodes(await getCategories(BRAND_SLUG), path.split("/"))
    : null;

  const leafCategoryId = categoryNodes?.[categoryNodes.length - 1]?.id;
  const relatedProducts = leafCategoryId
    ? await getProducts({ brandSlug: BRAND_SLUG, categoryId: leafCategoryId, size: 6 })
        .then((d) => d.products.filter((p) => p.slug !== slug).slice(0, 5))
        .catch(() => [])
    : [];

  return (
    <div className="pb-20 lg:pb-28">
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pt-8 lg:pt-10">
        <nav className="flex items-center gap-2 text-[13px] text-grey-500">
          <Link href="/" className="hover:text-ink transition-colors duration-200">Home</Link>
          {categoryNodes?.map((node, i, arr) => {
            const isLast = i === arr.length - 1;
            return (
              <span key={node.id} className="flex items-center gap-2">
                <span className="text-grey-300">/</span>
                {isLast
                  ? <Link href={`/category/${path}`} className="hover:text-ink transition-colors duration-200">{node.name}</Link>
                  : <span>{node.name}</span>
                }
              </span>
            );
          })}
          <span className="flex items-center gap-2">
            <span className="text-grey-300">/</span>
            <span className="text-ink">{product.name}</span>
          </span>
        </nav>
      </section>

      <ProductDetail product={product} slug={slug} initialSelections={attrParams as Record<string, string>} />

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-16 lg:mt-24">
          <h2 className="text-[22px] font-normal mb-8">You may also like</h2>
          <ProductGrid products={relatedProducts} categoryPath={path} />
        </section>
      )}
    </div>
  );
}
