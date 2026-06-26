"use client";

import { useState } from "react";
import Image from "next/image";

type ProductImage = { src: string; name: string };

export default function ImageGallery({ images }: { images: ProductImage[] }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-grey-100 aspect-[4/5] flex items-center justify-center text-[13px] text-grey-400">
        No image
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[76px_1fr] gap-3 sm:gap-4 lg:sticky lg:top-24">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`relative aspect-[4/5] transition-colors duration-200 ${
              i === selected ? "border border-black" : "border border-grey-200"
            }`}
          >
            <div className="absolute inset-0 bg-grey-100 overflow-hidden flex items-center justify-center p-1.5">
              <Image
                src={img.src}
                alt={img.name}
                fill
                className="object-contain mix-blend-multiply"
                sizes="76px"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative bg-grey-100 aspect-[4/5] overflow-hidden flex items-center justify-center p-14 sm:p-24">
        <Image
          src={images[selected].src}
          alt={images[selected].name}
          fill
          className="object-contain mix-blend-multiply"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </div>
  );
}
