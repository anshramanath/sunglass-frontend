"use client";

import Link from "next/link";
import Image from "next/image";
import { ProductListItem } from "@/lib/types";
import { useBookmarks } from "@/components/providers/BookmarkProvider";
import { BRAND } from "@/lib/brand";

function formatPrice(cents: number): string {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`;
}

export default function ProductCard({ product, categoryPath }: { product: ProductListItem; categoryPath?: string }) {
  const { toggle, isBookmarked } = useBookmarks();
  const thumbnail = product.images[0];
  const saved = isBookmarked(product.slug);

  const price =
    product.minPriceCents === product.maxPriceCents
      ? formatPrice(product.minPriceCents)
      : `${formatPrice(product.minPriceCents)} – ${formatPrice(product.maxPriceCents)}`;

  return (
    <Link href={`/product/${product.slug}${categoryPath ? `?path=${categoryPath}` : ""}`} className="group block">
      <div className="relative bg-grey-100 aspect-[4/5] overflow-hidden flex items-center justify-center p-3 sm:p-7">
        {thumbnail ? (
          <Image
            src={thumbnail.src}
            alt={thumbnail.name}
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
      </div>

      <div className="mt-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px]">{product.name}</p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (thumbnail) toggle({ productSlug: product.slug, name: product.name, imageSrc: thumbnail.src });
            }}
            className="shrink-0 grid place-items-center text-ink hover:opacity-60 transition-opacity duration-200"
            aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill={saved ? BRAND.accent : "none"} stroke={saved ? BRAND.accent : "currentColor"} strokeWidth="1.5">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
        <p className="text-[15px] mt-1">
          {product.salePriceCents ? (
            <>
              <span className="text-grey-500 line-through mr-1.5">{formatPrice(product.minPriceCents)}</span>
              <span className="text-sale">{formatPrice(product.salePriceCents)}</span>
            </>
          ) : (
            <span className="text-grey-700">{price}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
