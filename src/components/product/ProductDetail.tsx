"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductDetail as ProductDetailType, Variation } from "@/lib/types";
import { useCart } from "@/components/providers/CartProvider";
import { useBookmarks } from "@/components/providers/BookmarkProvider";
import { BRAND } from "@/lib/brand";
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

function getAttrNames(variations: Variation[]): string[] {
  return [...new Set(variations.flatMap((v) => v.attribute.map((a) => a.name)))];
}

function getAllOptions(variations: Variation[], attrName: string): string[] {
  return [...new Set(variations.flatMap((v) =>
    v.attribute.filter((a) => a.name === attrName).map((a) => a.option)
  ))];
}

function getAvailableOptions(
  variations: Variation[],
  attrName: string,
  selections: Record<string, string | null>
): Set<string> {
  const others = Object.entries(selections).filter(([k, v]) => k !== attrName && v !== null);
  const matching = variations.filter((v) =>
    others.every(([name, option]) => v.attribute.some((a) => a.name === name && a.option === option))
  );
  return new Set(matching.flatMap((v) => v.attribute.filter((a) => a.name === attrName).map((a) => a.option)));
}

function resolveVariation(
  variations: Variation[],
  attrNames: string[],
  selections: Record<string, string | null>
): Variation | null {
  if (attrNames.some((n) => !selections[n])) return null;
  return variations.find((v) =>
    attrNames.every((name) => v.attribute.some((a) => a.name === name && a.option === selections[name]))
  ) ?? null;
}

export default function ProductDetail({ product, slug, initialSelections = {} }: { product: ProductDetailType; slug: string; initialSelections?: Record<string, string> }) {
  const attrNames = getAttrNames(product.variations);

  const defaultSelections = Object.fromEntries(attrNames.map((n) => {
    if (initialSelections[n]) return [n, initialSelections[n]];
    const firstVar = product.variations[0];
    const match = firstVar?.attribute.find((a) => a.name === n);
    return [n, match?.option ?? null];
  }));

  const [selections, setSelections] = useState<Record<string, string | null>>(defaultSelections);
  const { add: addToCart } = useCart();
  const { toggle: toggleBookmark, isBookmarked } = useBookmarks();

  const variation = resolveVariation(product.variations, attrNames, selections);
  const images = variation && variation.images.length > 0 ? variation.images : product.productImages;

  const priceCents = variation
    ? (variation.sale && variation.salePriceCents ? variation.salePriceCents : variation.regularPriceCents)
    : (product.salePriceCents ?? product.minPriceCents);

  const regularCents = variation?.regularPriceCents ?? product.minPriceCents;
  const onSale = variation
    ? (variation.sale && variation.salePriceCents != null)
    : !!product.salePriceCents;

  function select(attrName: string, option: string) {
    setSelections((prev) => ({ ...prev, [attrName]: option }));
  }

  function handleAddToBag() {
    addToCart({
      productSlug: slug,
      attribute: attrNames.length > 0
        ? attrNames.map((n) => ({ name: n, option: selections[n] ?? "" }))
        : [],
      name: product.name,
      imageSrc: images[0]?.src ?? "",
      priceCents,
    });
  }

  function handleBookmark() {
    const thumbnail = product.productImages[0]?.src ?? images[0]?.src;
    if (!thumbnail) return;
    toggleBookmark({
      productSlug: slug,
      attribute: attrNames.map((n) => ({ name: n, option: selections[n] ?? "" })),
      name: product.name,
      imageSrc: thumbnail,
    });
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
            {attrNames.map((attrName) => {
              const allOpts = getAllOptions(product.variations, attrName);
              const available = getAvailableOptions(product.variations, attrName, selections);
              return (
                <div key={attrName}>
                  <p className="text-[15px] mb-3">
                    {attrName}
                    {selections[attrName] && (
                      <span className="text-grey-600 ml-2">— {selections[attrName]}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allOpts.map((option) => {
                      const isAvailable = available.has(option);
                      const isSelected = selections[attrName] === option;
                      return (
                        <button
                          key={option}
                          disabled={!isAvailable}
                          onClick={() => select(attrName, option)}
                          className={`border px-3.5 py-2 text-[13px] transition-colors duration-200 ${
                            isSelected
                              ? "border-ink bg-ink text-paper"
                              : isAvailable
                              ? "border-grey-300 hover:border-ink"
                              : "border-grey-200 text-grey-300 cursor-not-allowed"
                          }`}
                        >
                          {option}
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
            className="flex-1 bg-ink text-paper text-[15px] py-4 hover:bg-grey-800 transition-colors duration-200"
          >
            Add to Bag — {formatPrice(priceCents)}
          </button>
          <button
            onClick={handleBookmark}
            className="w-14 grid place-items-center border border-grey-300 hover:border-ink transition-colors duration-200"
            aria-label={isItemBookmarked ? "Remove from saved" : "Save product"}
          >
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={isItemBookmarked ? BRAND.accent : "none"} stroke={isItemBookmarked ? BRAND.accent : "currentColor"} strokeWidth="1.5">
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
