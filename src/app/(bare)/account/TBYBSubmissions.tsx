"use client";

import Image from "next/image";
import { useState } from "react";
import type { TBYBSubmissionRecord } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const STATUS: Record<string, { label: string; color: string }> = {
  Unpaid:   { label: "Unpaid",   color: "#737373" },
  Curating: { label: "Curating", color: "#737373" },
  Emailed:  { label: "Emailed",  color: "#737373" },
  Shipped:  { label: "Shipped",  color: "var(--color-brand)" },
  Received: { label: "Received", color: "#000000" },
  Refunded: { label: "Refunded", color: "#000000" },
};

function eyeRow(sphere: string, cylinder: string, axis: string) {
  return `Sphere ${sphere} · Cylinder ${cylinder} · Axis ${axis}`;
}

function SubmissionCard({ s }: { s: TBYBSubmissionRecord }) {
  const [open, setOpen] = useState(false);
  const status = STATUS[s.status] ?? { label: s.status, color: "#737373" };

  return (
    <div className="border border-grey-200">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 text-left"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
          <span><span className="text-grey-500">Submission</span> <span className="text-ink">#{s.id.slice(-8).toUpperCase()}</span></span>
          <span className="text-grey-500">Submitted {new Date(s.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] uppercase tracking-wider font-medium px-2.5 py-1 border" style={{ color: status.color, borderColor: status.color }}>{status.label}</span>
          <svg className={`w-4 h-4 text-grey-500 transition-transform duration-200 ${open ? "" : "rotate-180"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      <div className="px-5 sm:px-6 py-5 border-t border-grey-200 flex items-end justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-16 shrink-0 bg-grey-100 aspect-[4/5] overflow-hidden flex items-center justify-center p-1.5">
            <Image src={s.packageImageSrc} alt={s.packageName} width={64} height={80} className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px]">{s.packageName}</p>
            <p className="text-[13px] text-grey-500 mt-0.5">{s.packagePairsMin === s.packagePairsMax ? s.packagePairsMin : `${s.packagePairsMin}–${s.packagePairsMax}`} Pairs · {formatPrice(s.packagePriceCents)} Deposit</p>
            {s.refundedCents && <p className="text-[13px] mt-1 text-brand">Refunded {formatPrice(s.refundedCents)}</p>}
          </div>
        </div>
        {s.carrier && s.trackingNumber && (
          <p className="text-[13px] shrink-0"><span className="text-grey-500">{s.carrier}</span> · {s.trackingNumber}</p>
        )}
      </div>

      {open && (
        <div className="px-5 sm:px-6 pb-6 border-t border-grey-200">
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6 pt-6">
            <dl className="space-y-5">
              <div>
                <dt className="text-[13px] text-grey-500">Prescription — OD (Right)</dt>
                <dd className="text-[15px] mt-1">{eyeRow(s.odSphere, s.odCylinder, s.odAxis)}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Prescription — OS (Left)</dt>
                <dd className="text-[15px] mt-1">{eyeRow(s.osSphere, s.osCylinder, s.osAxis)}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Lens Type</dt>
                <dd className="text-[15px] mt-1">{s.lensType}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Helmet / Hat Size</dt>
                <dd className="text-[15px] mt-1">{s.helmetSize} · {s.hatSize}</dd>
              </div>
            </dl>
            <dl className="space-y-5">
              <div>
                <dt className="text-[13px] text-grey-500">Nose Bridge</dt>
                <dd className="text-[15px] mt-1">{s.noseBridge}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Sunglass Fit</dt>
                <dd className="text-[15px] mt-1">{s.buyingPreference}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Frame Type</dt>
                <dd className="text-[15px] mt-1">{s.frameType}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Prescription</dt>
                <dd className="text-[15px] mt-1">
                  {s.prescriptionUrl !== "None"
                    ? <a href={s.prescriptionUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">Prescription Upload</a>
                    : <span>None</span>}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Headshot</dt>
                <dd className="text-[15px] mt-1">
                  {s.headshotUrl !== "None"
                    ? <a href={s.headshotUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">Headshot Upload</a>
                    : <span>None</span>}
                </dd>
              </div>
            </dl>
          </div>
          <div className="mt-6 pt-6 border-t border-grey-200">
            <dt className="text-[13px] text-grey-500">Additional Info</dt>
            <dd className="text-[15px] mt-1 leading-relaxed">{s.specialRequests}</dd>
          </div>
          <div className="mt-6 pt-6 border-t border-grey-200">
            <dt className="text-[13px] text-grey-500">Contact</dt>
            <dd className="text-[15px] mt-1">
              {s.contactName} · {s.contactEmail} · {s.contactPhone}
            </dd>
            <dd className="text-[15px] mt-1">
              {s.shippingAddress
                ? `${s.shippingAddress.line1}${s.shippingAddress.line2 ? `, ${s.shippingAddress.line2}` : ""}, ${s.shippingAddress.city}, ${s.shippingAddress.state} ${s.shippingAddress.postalCode}`
                : "None"}
            </dd>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TBYBSubmissions({ submissions }: { submissions: TBYBSubmissionRecord[] }) {
  if (submissions.length === 0) return <p className="text-[15px] text-grey-500 mt-6">No submissions yet.</p>;
  
  return (
    <div className="mt-6 space-y-5">
      {submissions.map(s => <SubmissionCard key={s.id} s={s} />)}
    </div>
  );
}
