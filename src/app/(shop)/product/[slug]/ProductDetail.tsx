"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductDetail as ProductDetailType, Variation } from "@/lib/types";
import { useCart } from "@/components/providers/CartProvider";
import { useBookmarks } from "@/components/providers/BookmarkProvider";
import ImageGallery from "./ImageGallery";

function SizingAccordion({ images }: { images: { src: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 border-t border-grey-200">
      <div className="border-b border-grey-200">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between py-5 text-[15px] text-left"
        >
          Sizing &amp; Fit
          <svg
            className={`w-4 h-4 text-grey-500 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-standard"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="pb-6 space-y-3">
              {images.map((img, i) => (
                <div key={i} className="bg-grey-50 p-5">
                  <Image src={img.src} alt={img.name} width={600} height={400} className="w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPrice(cents: number) {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`;
}

function getAvailableOptions(
  variations: Variation[],
  attrName: string,
  selections: Record<string, string | null>
): Set<string> {
  const others = Object.entries(selections).filter(([k, v]) => k !== attrName && v !== null);
  const matching = variations.filter((v) =>
    others.every(([name, slug]) => v.attribute.some((a) => a.name === name && a.slug === slug))
  );
  return new Set(matching.flatMap((v) => v.attribute.filter((a) => a.name === attrName).map((a) => a.slug)));
}

function resolveVariation(
  variations: Variation[],
  attrNames: string[],
  selections: Record<string, string | null>
): Variation | null {
  if (attrNames.some((n) => !selections[n])) return null;
  return variations.find((v) =>
    attrNames.every((name) => v.attribute.some((a) => a.name === name && a.slug === selections[name]))
  ) ?? null;
}

export default function ProductDetail({ product, slug, initialSelections = {} }: { product: ProductDetailType; slug: string; initialSelections?: Record<string, string> }) {
  const rawAttrNames = product.attributes.map((a) => a.name);
  const attrNames = rawAttrNames.includes("color")
    ? ["color", ...rawAttrNames.filter((n) => n !== "color")]
    : rawAttrNames;

  const defaultSelections = Object.fromEntries(attrNames.map((n) => {
    if (initialSelections[n]) return [n, initialSelections[n]];
    const firstVar = product.variations[0];
    const match = firstVar?.attribute.find((a) => a.name === n);
    return [n, match?.slug ?? null];
  }));

  const [selections, setSelections] = useState<Record<string, string | null>>(defaultSelections);
  const { add: addToCart } = useCart();
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks();

  const hasVariations = product.variations.length > 0;
  const variation = hasVariations ? resolveVariation(product.variations, attrNames, selections) : null;
  const images = variation?.images.length ? variation.images : product.productImages;
  const sku = hasVariations ? (variation?.sku ?? null) : (product.sku ?? null);

  const priceCents = variation
    ? (variation.sale && variation.salePriceCents != null ? variation.salePriceCents : variation.regularPriceCents)
    : (product.salePriceCents ?? product.minPriceCents);
  const regularCents = variation?.regularPriceCents ?? product.minPriceCents;
  const onSale = variation
    ? (variation.sale && variation.salePriceCents != null)
    : !!product.salePriceCents;

  function select(attrName: string, slug: string) {
    setSelections((prev) => ({ ...prev, [attrName]: slug }));
  }

  function handleAddToBag() {
    if (!sku) return;
    addToCart({
      productId: product.id,
      productSlug: slug,
      attribute: attrNames.map((n) => {
        const attrSlug = selections[n] ?? "";
        const option = product.attributes.find((a) => a.name === n)?.options.find((o) => o.slug === attrSlug)?.option ?? attrSlug;
        return { name: n, option, slug: attrSlug };
      }),
      name: product.name,
      sku,
      imageSrc: images[0]?.src ?? "",
      priceCents,
    });
  }

  function handleBookmark() {
    const thumbnail = images[0]?.src ?? product.productImages[0]?.src;
    if (!thumbnail) return;
    toggleBookmark({ productId: product.id, productSlug: slug, name: product.name, imageSrc: thumbnail });
  }

  const isItemBookmarked = isBookmarked(slug);

  return (
    <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-6 lg:mt-8 grid lg:grid-cols-[minmax(0,640px)_1fr] gap-10 lg:gap-16 items-start">
      <ImageGallery images={images} />

      {/* Buy rail */}
      <div className="max-w-md">

        {product.sku && (
          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">{product.sku}</p>
        )}
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-2.5">{product.name}</h1>

        {/* Price */}
        <p className="text-[18px] mt-3">
          {onSale ? (
            <>
              <span className="text-grey-500 line-through mr-2">{formatPrice(regularCents)}</span>
              <span className="text-sale">{formatPrice(priceCents)}</span>
            </>
          ) : (
            formatPrice(priceCents)
          )}
        </p>

        {/* Variation selector */}
        {attrNames.length > 0 && (
          <div className="mt-8 flex flex-col gap-6">
            {attrNames.map((attrName, attrIndex) => {
              const allAttrs = product.attributes.find((a) => a.name === attrName)?.options ?? [];
              const available = getAvailableOptions(product.variations, attrName, attrIndex === 0 ? {} : selections);
              const isColor = allAttrs.some((o) => o.value);
              return (
                <div key={attrName}>
                  <p className="text-[15px] mb-3">
                    {attrName}
                    {selections[attrName] && (
                      <span className="text-grey-600 ml-2">
                        — {allAttrs.find((o) => o.slug === selections[attrName])?.option}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {isColor ? allAttrs.map((o) => {
                      const isAvailable = available.has(o.slug);
                      const isSelected = selections[attrName] === o.slug;
                      return (
                        <button
                          key={o.slug}
                          type="button"
                          title={o.option}
                          disabled={!isAvailable}
                          onClick={() => select(attrName, o.slug)}
                          className={`w-7 h-7 rounded-full border border-grey-200 transition-all duration-150 ${
                            isSelected ? "ring-[1.5px] ring-ink ring-offset-1" : isAvailable ? "hover:ring-[1.5px] hover:ring-grey-400 hover:ring-offset-1" : "opacity-30 cursor-not-allowed"
                          }`}
                          style={{ backgroundColor: o.value }}
                        />
                      );
                    }) : allAttrs.map((o) => {
                      const isAvailable = available.has(o.slug);
                      const isSelected = selections[attrName] === o.slug;
                      return (
                        <button
                          key={o.slug}
                          disabled={!isAvailable}
                          onClick={() => select(attrName, o.slug)}
                          className={`border px-3.5 py-2 text-[13px] transition-colors duration-200 ${
                            isSelected
                              ? "border-ink bg-ink text-paper"
                              : isAvailable
                              ? "border-grey-300 hover:border-ink"
                              : "border-grey-200 text-grey-300 cursor-not-allowed"
                          }`}
                        >
                          {o.option}
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
            Add to Bag — {formatPrice(priceCents)}
          </button>
          <button
            onClick={handleBookmark}
            className="w-14 grid place-items-center border border-grey-300 hover:border-ink transition-colors duration-200"
            aria-label={isItemBookmarked ? "Remove from saved" : "Save product"}
          >
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={isItemBookmarked ? "var(--color-brand)" : "none"} stroke={isItemBookmarked ? "var(--color-brand)" : "currentColor"} strokeWidth="1.5">
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
