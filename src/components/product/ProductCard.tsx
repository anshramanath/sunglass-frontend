"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductListItem, ListVariation } from "@/lib/types";
import { useBookmarks } from "@/components/providers/BookmarkProvider";
import { BRAND } from "@/lib/brand";

const MAX_SWATCHES = 5;

function formatPrice(cents: number): string {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`;
}

function colorAttr(v: ListVariation) {
  return v.attribute.find((a) => a.name === "color" && a.value);
}

export default function ProductCard({ product, categoryPath }: { product: ProductListItem; categoryPath?: string }) {
  const { toggle, isBookmarked } = useBookmarks();
  const router = useRouter();
  const [hoveredVar, setHoveredVar] = useState<ListVariation | null>(null);

  const thumbnail = product.images[0];
  const saved = isBookmarked(product.slug);
  const colorVariations = product.variations.filter((v) => colorAttr(v));
  const visibleVars = colorVariations.slice(0, MAX_SWATCHES);
  const overflow = colorVariations.length - MAX_SWATCHES;

  const displaySrc = hoveredVar?.imageSrc ?? thumbnail?.src;
  const displayAlt = hoveredVar ? (colorAttr(hoveredVar)?.option ?? product.name) : (thumbnail?.name ?? product.name);

  const pathParam = categoryPath ? `path=${categoryPath}` : null;
  const href = `/product/${product.slug}${pathParam ? `?${pathParam}` : ""}`;

  const price =
    product.minPriceCents === product.maxPriceCents
      ? formatPrice(product.minPriceCents)
      : `${formatPrice(product.minPriceCents)} – ${formatPrice(product.maxPriceCents)}`;

  return (
    <div className="group">
      <Link href={href} className="block relative bg-grey-100 aspect-[4/5] overflow-hidden flex items-center justify-center p-3 sm:p-7">
        {displaySrc ? (
          <Image
            src={displaySrc}
            alt={displayAlt ?? ""}
            width={300}
            height={300}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-[420ms] ease-standard group-hover:scale-[1.04]"
          />
        ) : (
          <span className="text-[13px] text-grey-400">No image</span>
        )}
        {product.sale && (
          <span className="absolute top-3 right-3 bg-sale text-paper text-[11px] uppercase tracking-wide font-medium px-2 py-1">
            Sale
          </span>
        )}
        {product.featured && (
          <span className="absolute top-3 left-3 whitespace-nowrap bg-paper/90 text-ink border border-grey-200 text-[11px] uppercase tracking-wider font-medium px-2.5 py-1">
            Best Seller
          </span>
        )}
      </Link>

      <div className="mt-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="text-[15px] hover:opacity-60 transition-opacity duration-200">{product.name}</Link>
          <button
            type="button"
            onClick={() => { if (thumbnail) toggle({ productSlug: product.slug, name: product.name, imageSrc: thumbnail.src }); }}
            className="shrink-0 grid place-items-center text-ink hover:opacity-60 transition-opacity duration-200"
            aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill={saved ? BRAND.accent : "none"} stroke={saved ? BRAND.accent : "currentColor"} strokeWidth="1.5">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <Link href={href} className="block text-[15px] mt-1 hover:opacity-60 transition-opacity duration-200">
          {product.salePriceCents ? (
            <>
              <span className="text-grey-500 line-through mr-1.5">{formatPrice(product.minPriceCents)}</span>
              <span className="text-sale">{formatPrice(product.salePriceCents)}</span>
            </>
          ) : (
            <span className="text-grey-700">{price}</span>
          )}
        </Link>

        {colorVariations.length > 0 && (
          <div
            className="flex items-center gap-1.5 mt-2.5"
            onMouseLeave={() => setHoveredVar(null)}
          >
            {visibleVars.map((v) => {
              const c = colorAttr(v)!;
              const isHovered = hoveredVar === v;
              return (
                <button
                  key={v.id}
                  type="button"
                  title={c.option}
                  onMouseEnter={() => setHoveredVar(v)}
                  onClick={() => {
                    const q = [`color=${c.slug}`, pathParam].filter(Boolean).join("&");
                    router.push(`/product/${product.slug}?${q}`);
                  }}
                  className={`w-4 h-4 rounded-full border border-grey-200 transition-all duration-150 ${
                    isHovered ? "ring-[1.5px] ring-ink ring-offset-1" : "hover:ring-[1.5px] hover:ring-grey-400 hover:ring-offset-1"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              );
            })}
            {overflow > 0 && (
              <Link href={href} className="text-[12px] text-grey-500 hover:text-ink transition-colors duration-150 ml-0.5">
                +{overflow}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
