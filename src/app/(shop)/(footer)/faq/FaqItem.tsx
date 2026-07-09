"use client";

import { useState } from "react";

export default function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-grey-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-[15px] text-left"
      >
        <span>{question}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-grey-500 transition-transform duration-300 ${open ? "rotate-45" : ""}`}
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
          <div className="pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
