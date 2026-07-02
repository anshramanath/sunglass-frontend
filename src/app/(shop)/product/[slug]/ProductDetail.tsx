"use client";

import { useState } from "react";
import { ProductDetail as ProductDetailType, Variation } from "@/lib/types";
import { useAddToCart } from "@/components/providers/CartProvider";
import { useIsBookmarked, useToggleBookmark } from "@/components/providers/BookmarkProvider";
import ImageGallery from "./ImageGallery";
import SizingAccordion from "./SizingAccordion";
import { formatPrice } from "@/lib/utils";

function getAvailableOptions(
  variations: Variation[],
  attrName: string,
  otherSelections: Record<string, string>
): Set<string> {
  const others = Object.entries(otherSelections) as [string, string][];
  const matching = variations.filter((v) =>
    others.every(([name, slug]) => v.attribute.some((a) => a.name === name && a.slug === slug))
  );
  return new Set(matching.flatMap((v) => v.attribute.filter((a) => a.name === attrName).map((a) => a.slug)));
}

function resolveVariation(variations: Variation[], selections: Record<string, string>): Variation | null {
  const entries = Object.entries(selections) as [string, string][];
  if (entries.length === 0) return null;
  return variations.find((v) =>
    v.attribute.length === entries.length &&
    entries.every(([name, val]) => v.attribute.some((a) => a.name === name && a.slug === val))
  ) ?? null;
}

export default function ProductDetail({ product, initialSelections }: { product: ProductDetailType; initialSelections: Record<string, string> }) {
  const rawAttrNames = product.attributes.map((a) => a.name);
  const attrNames = rawAttrNames.includes("color")
    ? ["color", ...rawAttrNames.filter((n) => n !== "color")]
    : rawAttrNames;

  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);
  
  const addToCart = useAddToCart();
  const toggleBookmark = useToggleBookmark();
  const isBookmarked = useIsBookmarked(product);
  
  const variation = product.variations.length > 0 ? resolveVariation(product.variations, selections) : null;
  const images = variation?.images.length ? variation.images : product.productImages;
  const sku = variation?.sku ?? product.sku;

  const salePriceCents = variation?.salePriceCents ?? product.salePriceCents;
  const regularPriceCents = variation?.regularPriceCents ?? product.minPriceCents;
  const onSale = variation?.sale ?? product.sale;

  const availableByAttr = Object.fromEntries(
    attrNames
      .filter((name) => !(name in selections))
      .map((name) => [name, getAvailableOptions(product.variations, name, selections)])
  ) as Record<string, Set<string>>;

  function select(attrName: string, slug: string) {
    if (attrName in selections && selections[attrName] === slug) {
      const { [attrName]: _, ...rest } = selections;
      setSelections(rest as Record<string, string>);
    } else if (attrName in selections && selections[attrName] !== slug) {
      setSelections({ [attrName]: slug });
    } else if (!availableByAttr[attrName].has(slug)) {
      setSelections({ [attrName]: slug });
    } else {
      setSelections({ ...selections, [attrName]: slug });
    }
  }

  function handleAddToBag() {
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      attribute: Object.entries(selections).map(([name, slug]) => {
        const option = product.attributes.find((a) => a.name === name)?.options.find((o) => o.slug === slug)?.option ?? slug;
        return { name, option, slug };
      }),
      name: product.name,
      sku: sku!,
      imageSrc: images[0].src,
      priceCents: onSale ? salePriceCents! : regularPriceCents,
    });
  }


  return (
    <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-6 lg:mt-8 grid lg:grid-cols-[minmax(0,640px)_1fr] gap-10 lg:gap-16 items-start">
      <ImageGallery images={images} />

      {/* Buy rail */}
      <div className="max-w-md">

        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-2.5">{product.name}</h1>

        {/* Price */}
        <p className="text-[18px] mt-3">
          {!sku ? (
            product.minPriceCents === product.maxPriceCents
              ? formatPrice(product.minPriceCents)
              : `${formatPrice(product.minPriceCents)} – ${formatPrice(product.maxPriceCents)}`
          ) : onSale ? (
            <>
              <span className="text-grey-500 line-through mr-2">{formatPrice(regularPriceCents)}</span>
              <span style={{ color: "var(--color-brand)" }}>{formatPrice(salePriceCents!)}</span>
            </>
          ) : (
            formatPrice(regularPriceCents)
          )}
        </p>

        {/* Variation selector */}
        {attrNames.length > 0 && (
          <div className="mt-8 flex flex-col gap-6">
            {attrNames.map((attrName) => {
              const options = [...(product.attributes.find((a) => a.name === attrName)?.options ?? [])].sort((a, b) => parseFloat(a.option) - parseFloat(b.option));
              const available = availableByAttr[attrName];
              const attrSelected = selections[attrName];
              const isColor = attrName === "color";
              return (
                <div key={attrName}>
                  <p className="text-[15px] mb-3">
                    {attrName}
                    {attrSelected && (
                      <span className="text-grey-600 ml-2">
                        — {options.find((o) => o.slug === attrSelected)!.option}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {isColor ? options.map((o) => {
                      const isAvailable = attrSelected ? true : available.has(o.slug);
                      const isSelected = selections[attrName] === o.slug;
                      return (
                        <button
                          key={o.slug}
                          type="button"
                          title={o.option}
                          onClick={() => select(attrName, o.slug)}
                          className={`relative w-7 h-7 rounded-full border border-grey-200 transition-all duration-150 ${
                            isSelected ? "ring-[1.5px] ring-ink ring-offset-1" : isAvailable ? "hover:ring-[1.5px] hover:ring-grey-400 hover:ring-offset-1" : ""
                          }`}
                          style={{ backgroundColor: o.value }}
                        >
                          {!isAvailable && (
                            <svg className="absolute inset-0 w-full h-full rounded-full" viewBox="0 0 28 28" preserveAspectRatio="none">
                              <line x1="0" y1="0" x2="28" y2="28" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
                            </svg>
                          )}
                        </button>
                      );
                    }) : options.map((o) => {
                      const isAvailable = attrSelected ? true : available.has(o.slug);
                      const isSelected = selections[attrName] === o.slug;
                      return (
                        <button
                          key={o.slug}
                          type="button"
                          onClick={() => select(attrName, o.slug)}
                          className={`relative border px-3.5 py-2 text-[13px] transition-colors duration-200 ${
                            isSelected
                              ? "border-ink bg-ink text-paper"
                              : isAvailable
                              ? "border-grey-300 hover:border-ink"
                              : "border-grey-200 text-grey-300"
                          }`}
                        >
                          {o.option}
                          {!isAvailable && (
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add to bag + bookmark */}
        <div className="flex items-stretch gap-3 mt-8">
          <button
            onClick={handleAddToBag}
            disabled={!sku}
            className="flex-1 bg-ink text-paper text-[15px] py-4 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Bag{sku && ` — ${formatPrice(onSale ? salePriceCents! : regularPriceCents)}`}
          </button>
          <button
            onClick={() => toggleBookmark({ productId: product.id, productSlug: product.slug, name: product.name, imageSrc: images[0].src })}
            className="w-14 grid place-items-center border border-grey-300 hover:border-ink transition-colors duration-200"
            aria-label={isBookmarked ? "Remove from saved" : "Save product"}
          >
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={isBookmarked ? "var(--color-brand)" : "none"} stroke={isBookmarked ? "var(--color-brand)" : "currentColor"} strokeWidth="1.5">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* Summary bullets + description */}
        {product.summary.length > 0 && (
          <ul className="mt-8 space-y-2.5 border-t border-grey-200 pt-7">
            {product.summary.map((point, i) => (
              <li key={i} className="flex gap-3 text-[15px] text-grey-700">
                <span className="text-ink mt-0.5 shrink-0">—</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {product.description && (
          <p className="mt-6 text-[15px] text-grey-600 leading-relaxed">{product.description}</p>
        )}

        {/* Sizing & Fit accordion */}
        {product.descriptionImages.length > 0 && (
          <SizingAccordion images={product.descriptionImages} />
        )}
      </div>
    </section>
  );
}
