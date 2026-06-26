import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { collectLeaves } from "@/lib/utils";
import ProductGrid from "@/components/product/ProductGrid";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";

async function BestSellers() {
  const tree = await getCategories();
  const leaves = Object.values(collectLeaves(tree));
  for (const { id } of leaves) {
    const res = await getProducts({ categoryId: id, size: 10 }).catch(() => null);
    if (res && res.totalProducts >= 10) return <ProductGrid products={res.products} />;
  }
  return null;
}

export default async function HomePage() {
  const brand = getBrand();
  const tree = await getCategories();
  const leaves = Object.values(collectLeaves(tree));
  const first = leaves[0];
  const shopHref = first ? `/category/${first.path}` : "/sale";
  const bgs = ["bg-grey-100", "bg-grey-50"];

  return (
    <>
      {/* ── Hero ── */}
      <section className="grid lg:grid-cols-2">
        <div className="bg-grey-50 flex items-center px-6 sm:px-12 lg:px-16 py-20 lg:py-0 lg:min-h-[80vh] order-2 lg:order-1">
          <div className="max-w-md">
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">
              {brand.heroCopy.eyebrow}
            </p>
            <h1 className="text-[56px] lg:text-[68px] font-normal tracking-[-0.01em] leading-[1.03] mt-5">
              {brand.heroCopy.title.split("\n").map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>
            <p className="text-[16px] text-grey-600 leading-relaxed mt-6">
              {brand.heroCopy.body}
            </p>
            <div className="flex items-center gap-6 mt-9">
              <Link href={shopHref} className="bg-ink text-paper text-[15px] px-7 py-3.5 hover:bg-grey-800 transition-colors duration-200">
                Shop Sunglasses
              </Link>
              <Link href="/sale" className="text-[15px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
                Shop Sale
              </Link>
            </div>
          </div>
        </div>
        <div className="group bg-grey-100 lg:min-h-[80vh] order-1 lg:order-2 flex items-center justify-center p-10 sm:p-16 relative overflow-hidden">
          <Image
            src={brand.hero}
            alt={`${brand.name} hero eyewear`}
            width={900}
            height={600}
            className="w-full max-h-[60vh] object-contain mix-blend-multiply transition-transform duration-[600ms] ease-standard group-hover:scale-[1.04]"
            priority
          />
          <span className="absolute bottom-6 right-6 text-[13px] uppercase tracking-wider text-grey-500">
            ES123K23
          </span>
        </div>
      </section>

      {/* ── Shop by category ── */}
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 py-16 lg:py-24">
        <div className="mb-9">
          <h2 className="text-[26px] lg:text-[34px] font-normal">Top categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {brand.categoryImages.map((image, i) => {
            const leaf = leaves[i % leaves.length];
            return (
              <Link key={i} href={`/category/${leaf.path}`} className={`group block${i === 4 ? " hidden lg:block" : ""}`}>
                <div className="bg-grey-100 aspect-[4/5] overflow-hidden flex items-center justify-center p-3 sm:p-7">
                  <Image
                    src={image}
                    alt={leaf.name}
                    width={400}
                    height={500}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-[420ms] ease-standard group-hover:scale-[1.04]"
                  />
                </div>
                <p className="text-[15px] mt-3">{leaf.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Best sellers ── */}
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 pb-16 lg:pb-24">
        <div className="mb-9">
          <h2 className="text-[26px] lg:text-[34px] font-normal">Best sellers</h2>
        </div>
        <Suspense fallback={<LoadingSkeleton cols={5} count={10} />}>
          <BestSellers />
        </Suspense>
      </section>

      {/* ── Editorial split ── */}
      <section className="grid sm:grid-cols-2">
        {brand.editorial.map((slot, i) => {
          const leaf = leaves[(4 + i) % leaves.length];
          return (
            <Link key={i} href={`/category/${leaf.path}`} className={`group relative ${bgs[i]} min-h-[58vh] overflow-hidden flex items-center justify-center p-12${i === 1 ? " hidden sm:flex" : ""}`}>
              <Image
                src={slot.image}
                alt={slot.body}
                width={600}
                height={400}
                className="w-full max-h-[45vh] object-contain mix-blend-multiply transition-transform duration-[600ms] ease-standard group-hover:scale-[1.05]"
              />
              <div className="absolute bottom-9 left-9">
                <p className="text-[13px] uppercase tracking-wider text-grey-500">{leaf.name}</p>
                <p className="text-[34px] font-normal mt-2">{slot.body}</p>
                <span className="inline-block mt-4 text-[15px] underline underline-offset-4 group-hover:opacity-60 transition-opacity duration-200">
                  Shop now
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}
