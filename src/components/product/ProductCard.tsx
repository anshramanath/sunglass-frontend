"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductListItem, ListVariation } from "@/lib/types";
import { useIsBookmarked, useToggleBookmark } from "@/components/providers/BookmarkProvider";

const MAX_SWATCHES = 5;

function formatPrice(cents: number): string {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`;
}

export default function ProductCard({ product, categoryPath }: { product: ProductListItem; categoryPath?: string }) {
  const toggle = useToggleBookmark();
  const isBookmarked = useIsBookmarked(product.slug);
  const router = useRouter();
  const [hoveredVar, setHoveredVar] = useState<ListVariation | null>(null);

  const saved = isBookmarked;
  const colorVariations = (product.variations ?? []).filter((v) => v.value);
  const visibleVars = colorVariations.slice(0, MAX_SWATCHES);
  const overflow = colorVariations.length - MAX_SWATCHES;

  const displaySrc = hoveredVar?.imageSrc ?? product.imageSrc;
  const displayAlt = hoveredVar ? (hoveredVar.option ?? product.name) : (product.imageName ?? product.name);

  const pathParam = categoryPath ? `path=${categoryPath}` : null;
  const colorParam = hoveredVar ? `color=${hoveredVar.slug}` : null;
  const qs = [colorParam, pathParam].filter(Boolean).join("&");
  const href = `/product/${product.slug}${qs ? `?${qs}` : ""}`;

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
          <span className="absolute top-3 right-3 text-paper text-[11px] uppercase tracking-wide font-medium px-2 py-1" style={{ backgroundColor: "var(--color-brand)" }}>
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
            onClick={() => { if (product.imageSrc) toggle({ productId: product.id, productSlug: product.slug, name: product.name, imageSrc: product.imageSrc }); }}
            className="shrink-0 grid place-items-center text-ink hover:opacity-60 transition-opacity duration-200"
            aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill={saved ? "var(--color-brand)" : "none"} stroke={saved ? "var(--color-brand)" : "currentColor"} strokeWidth="1.5">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <Link href={href} className="block text-[15px] mt-1 hover:opacity-60 transition-opacity duration-200">
          {product.salePriceCents ? (
            <>
              <span className="text-grey-500 line-through mr-1.5">{formatPrice(product.minPriceCents)}</span>
              <span style={{ color: "var(--color-brand)" }}>{formatPrice(product.salePriceCents)}</span>
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
              const isHovered = hoveredVar === v;
              return (
                <button
                  key={v.slug}
                  type="button"
                  title={v.option}
                  onMouseEnter={() => setHoveredVar(v)}
                  onClick={() => {
                    const q = [`color=${v.slug}`, pathParam].filter(Boolean).join("&");
                    router.push(`/product/${product.slug}?${q}`);
                  }}
                  className={`w-4 h-4 rounded-full border border-grey-200 transition-all duration-150 ${
                    isHovered ? "ring-[1.5px] ring-ink ring-offset-1" : "hover:ring-[1.5px] hover:ring-grey-400 hover:ring-offset-1"
                  }`}
                  style={{ backgroundColor: v.value }}
                />
              );
            })}
            {overflow > 0 && (
              <Link href={href} className="text-[13px] text-grey-500 hover:text-ink transition-colors duration-150 ml-0.5">
                +{overflow}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
