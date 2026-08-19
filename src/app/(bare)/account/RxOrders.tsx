"use client";

import Image from "next/image";
import { useState } from "react";
import type { RxOrder } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const STATUS: Record<string, { label: string; color: string }> = {
  Unpaid:     { label: "Unpaid",     color: "#737373" },
  Processing: { label: "Processing", color: "#737373" },
  Emailed:    { label: "Emailed",    color: "#737373" },
  Shipped:    { label: "Shipped",    color: "var(--color-brand)" },
  Refunded:   { label: "Refunded",   color: "#000000" },
};

function eyeRow(sphere: string, cylinder: string, axis: string) {
  return `Sphere ${sphere} · Cylinder ${cylinder} · Axis ${axis}`;
}

function RxOrderCard({ o }: { o: RxOrder }) {
  const [open, setOpen] = useState(false);
  const status = STATUS[o.status] ?? { label: o.status, color: "#737373" };
  const pdDisplay = o.pdMode === "Dual" ? `Left ${o.pdLeft} · Right ${o.pdRight}` : o.pd;

  return (
    <div className="border border-grey-200">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 text-left"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
          <span><span className="text-grey-500">Rx Order</span> <span className="text-ink">#{o.id.slice(-8).toUpperCase()}</span></span>
          <span className="text-grey-500">Created {new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
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
            <Image src={o.frameImageSrc} alt={o.frameName} width={64} height={80} className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px]">{o.frameName}</p>
            <p className="text-[13px] text-grey-500 mt-0.5">{o.frameColor} · {formatPrice(o.framePriceCents)}</p>
            {o.refundedCents !== null && <p className="text-[13px] mt-1 text-brand">Refunded {formatPrice(o.refundedCents)}</p>}
          </div>
        </div>
        {o.carrier && o.trackingNumber && (
          <p className="text-[13px] shrink-0"><span className="text-grey-500">{o.carrier}</span> · {o.trackingNumber}</p>
        )}
      </div>

      {open && (
        <div className="px-5 sm:px-6 pb-6 border-t border-grey-200">
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6 pt-6">
            <dl className="space-y-5">
              <div>
                <dt className="text-[13px] text-grey-500">Prescription — OD (Right)</dt>
                <dd className="text-[15px] mt-1">{eyeRow(o.odSphere, o.odCylinder, o.odAxis)}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Prescription — OS (Left)</dt>
                <dd className="text-[15px] mt-1">{eyeRow(o.osSphere, o.osCylinder, o.osAxis)}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">PD</dt>
                <dd className="text-[15px] mt-1">{pdDisplay}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Vision Type</dt>
                <dd className="text-[15px] mt-1">{o.visionType}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Lens Material</dt>
                <dd className="text-[15px] mt-1">{o.lensMaterial}</dd>
              </div>
            </dl>
            <dl className="space-y-5">
              <div>
                <dt className="text-[13px] text-grey-500">Lens Color</dt>
                <dd className="text-[15px] mt-1">{o.lensColorCategory} — {o.lensColor}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">AR Coating</dt>
                <dd className="text-[15px] mt-1">{o.arCoating}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Scratch Coating</dt>
                <dd className="text-[15px] mt-1">{o.scratchCoating}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Mirror Coating</dt>
                <dd className="text-[15px] mt-1">{o.mirrorCoating}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Prescription</dt>
                <dd className="text-[15px] mt-1">
                  {o.prescriptionUrl !== "None"
                    ? <a href={o.prescriptionUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">Prescription Upload</a>
                    : <span>None</span>}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] text-grey-500">Headshot</dt>
                <dd className="text-[15px] mt-1">
                  {o.headshotUrl !== "None"
                    ? <a href={o.headshotUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">Headshot Upload</a>
                    : <span>None</span>}
                </dd>
              </div>
            </dl>
          </div>
          <div className="mt-6 pt-6 border-t border-grey-200">
            <dt className="text-[13px] text-grey-500">Additional Info</dt>
            <dd className="text-[15px] mt-1 leading-relaxed">{o.comments}</dd>
          </div>
          <div className="mt-6 pt-6 border-t border-grey-200">
            <dt className="text-[13px] text-grey-500">Payment</dt>
            <dd className="text-[15px] mt-1">Total {formatPrice(o.totalPriceCents)} · Deposit {formatPrice(o.depositUsedCents ?? 0)} · Charged {formatPrice(o.stripeChargeCents)}</dd>
          </div>
          <div className="mt-6 pt-6 border-t border-grey-200">
            <dt className="text-[13px] text-grey-500">Contact</dt>
            <dd className="text-[15px] mt-1">
              {o.contactName} · {o.contactEmail} · {o.contactPhone}
            </dd>
            <dd className="text-[15px] mt-1">
              {o.shippingAddress
                ? `${o.shippingAddress.line1}${o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}, ${o.shippingAddress.city}, ${o.shippingAddress.state} ${o.shippingAddress.postalCode}`
                : "None"}
            </dd>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RxOrders({ orders }: { orders: RxOrder[] }) {
  if (orders.length === 0) return <p className="text-[15px] text-grey-500 mt-6">No Rx orders yet.</p>;

  return (
    <div className="mt-6 space-y-5">
      {orders.map(o => <RxOrderCard key={o.id} o={o} />)}
    </div>
  );
}
