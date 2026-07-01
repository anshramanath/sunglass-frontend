"use client";

import { useState } from "react";
import Image from "next/image";

export default function SizingAccordion({ images }: { images: { src: string; name: string }[] }) {
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
