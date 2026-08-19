"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import type { PrescriptionFrame, PrescriptionFrameColor, RxFrameSubmission } from "@/lib/types";
import { getDeposit, submitRxOrder, uploadFile } from "@/lib/api";
import { getBrand } from "@/lib/brand";

const brandSlug = getBrand().slug;

function sphereOptsForRange(rxLow: number, rxHigh: number): string[] {
  const steps = Math.round((rxHigh - rxLow) / 0.25);
  const opts: string[] = [];
  for (let i = steps; i >= 0; i--) {
    const raw = Math.round((rxLow + i * 0.25) * 100) / 100;
    if (raw === 0) opts.push("None");
    else if (raw > 0) opts.push("+" + raw.toFixed(2));
    else opts.push(raw.toFixed(2));
  }
  return opts;
}

const AXIS_OPTS = Array.from({ length: 180 }, (_, i) => `${i + 1}°`);
const PD_OPTS = [...Array.from({ length: 51 }, (_, i) => String(50 + i * 0.5)), "None"];
const PD_DUAL_OPTS = Array.from({ length: 41 }, (_, i) => String(20 + i * 0.5));

const VISION_TYPES = [
  "Traditional Single Vision (+$99)",
  "Digital Single Vision w/ Wider Peripheral (+$129)",
  "Digital Progressives (+$249)",
  "Digital Sport Progressives (+$359)",
  "FT 28 Bifocals (+$159)",
];

const LENS_MATERIALS = [
  "Impact Resistant Polycarbonate",
  "Impact Resistant Trivex (+$39)",
];

const TRANSITIONS_OPTS = [
  "Gen8 Clear to Grey ($99)", "Gen8 Clear to Brown ($99)", "Gen8 Clear to Amber ($99)",
  "Gen8 Clear to Graphite Green ($99)", "Gen8 Clear to Amethyst Purple ($99)",
  "Gen8 Clear to Emerald Green ($99)", "Gen8 Clear to Sapphire Blue ($99)",
  "XtrActive Darkest Clear to Dark Gray ($119)", "XtrActive Clear to Dark Brown ($119)",
  "XtrActive Polarized Clear to Gray ($169)",
];

const POLARIZED_OPTS = ["Polarized Gray (+$79)", "Polarized Brown (+$79)"];

const TINTED_OPTS = [
  "Dark Gray (+$15)", "Light Gray (+$15)", "Dark Brown (+$15)", "Light Brown (+$15)",
  "G-15 Gray/Green (+$15)", "HD Copper (+$15)", "Yellow (+$15)", "Rose (+$15)",
  "Blue (+$15)", "Purple (+$15)", "Clear / No Tint",
];

const AR_COATING_OPTS = [
  "Classic A/R: Basic A/R w/ Standard Oleophobic, Hydrophobic Coat & Scratch Coat (+$79)",
  "Elite A/R: Superior A/R w/ Best Oleo/Hydrophobic Coat & Scratch Coat (+$99)",
  "Elite A/R + Anti Fog: Includes Permanent Anti-Fog Coat + 2 yr Scratch Warranty (+$159)",
  "None",
];

const SCRATCH_COAT_OPTS = [
  "Multi Layer Baked On Ultimate Scratch Coat (+$39)",
  "None",
];

const MIRROR_COAT_OPTS = [
  "Flash Style Mirror Silver (+$65)", "Flash Style Mirror Gold (+$65)", "Flash Style Mirror Blue (+$65)",
  "Flash Style Mirror Green (+$65)", "Flash Style Mirror Cobalt (+$65)", "Flash Style Mirror Red (+$65)",
  "Flash Style Mirror Pink (+$65)", "Solid Mirror Silver (+$65)", "Solid Mirror Black (+$65)",
  "Solid Mirror Gold (+$65)", "Solid Mirror Blue (+$65)", "Solid Mirror Cobalt (+$65)",
  "Solid Mirror Green (+$65)", "Solid Mirror Orange (+$65)", "Solid Mirror Red (+$65)",
  "Solid Mirror Pink (+$65)", "None",
];

// ── Dropdown ──────────────────────────────────────────────────────────────────

function PriceLabel({ text }: { text: string }) {
  const i = text.indexOf("(");
  if (i === -1) return <>{text}</>;
  return <>{text.slice(0, i)}<span className="text-brand">{text.slice(i)}</span></>;
}

function Dropdown({ id, opts, value, onChange, disabled, openId, setOpenId }: {
  id: string; opts: string[]; value: string | null; onChange: (v: string) => void;
  disabled?: boolean; openId: string | null; setOpenId: (id: string | null) => void;
}) {
  const isOpen = openId === id && !disabled;

  return (
    <div className="relative">
      <button type="button" disabled={disabled} onClick={() => setOpenId(isOpen ? null : id)}
        className="w-full flex items-center justify-between gap-2 border border-grey-300 hover:border-ink disabled:hover:border-grey-300 disabled:text-grey-400 disabled:bg-grey-50 transition-colors duration-200 px-3.5 h-11 text-[15px] text-left bg-paper">
        <span className="truncate">{disabled ? "—" : value ? <PriceLabel text={value} /> : "Select"}</span>
        <svg className="w-4 h-4 text-grey-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpenId(null)} />
          <div className="absolute left-0 right-0 top-full z-30 mt-1 bg-paper border border-grey-300 shadow-pop max-h-64 overflow-y-auto">
            {opts.map(o => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpenId(null); }}
                className="w-full text-left px-3.5 py-2.5 text-[15px] hover:bg-grey-50 transition-colors duration-200">
                <PriceLabel text={o} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── File upload ───────────────────────────────────────────────────────────────

function FileUpload({ id, url, uploading, label, onChange }: { id: string; url: string | null; uploading: boolean; label: string; onChange: (f: File | null) => void }) {
  return (
    <div>
      <input id={id} type="file" className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
      <label htmlFor={id} className="flex items-center gap-3 border border-dashed border-grey-300 hover:border-ink transition-colors duration-200 px-4 h-14 cursor-pointer">
        {url ? (
          <svg className="w-5 h-5 text-ink shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-5 h-5 text-grey-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4M12 4 7 9M12 4l5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
        )}
        {uploading ? (
          <span className="text-[15px] text-grey-400">Uploading…</span>
        ) : url ? (
          <span className="flex items-center gap-2 min-w-0">
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              className="text-[15px] text-ink underline underline-offset-4 truncate">{label}</a>
            <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); onChange(null); }}
              className="shrink-0 text-[13px] text-grey-400 hover:text-ink underline underline-offset-4 transition-colors duration-200">Remove</button>
          </span>
        ) : (
          <span className="text-[15px] text-grey-500">Browse A File</span>
        )}
      </label>
    </div>
  );
}

// ── Step dots ─────────────────────────────────────────────────────────────────

function StepDots({ step }: { step: number }) {
  return (
    <div className={`flex items-center justify-center gap-3 mb-10 ${step === 6 ? "opacity-30" : ""}`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Fragment key={n}>
          <span className={`text-[13px] w-7 h-7 rounded-full grid place-items-center border ${n <= step ? "border-brand bg-brand text-paper" : "border-grey-300 text-grey-500"}`}>
            {n}
          </span>
          {n < 5 && <span className={`w-6 h-px ${n < step ? "bg-brand" : "bg-grey-300"}`} />}
        </Fragment>
      ))}
    </div>
  );
}

// ── Rx info banner ────────────────────────────────────────────────────────────

function RxInfoBanner() {
  return (
    <div className="border border-grey-200 bg-grey-50 px-5 py-5 text-[13px] text-grey-600 leading-relaxed space-y-3">
      <p><span className="text-ink">Please note:</span> Rx orders take <span className="text-ink">10–15 business days</span> to complete.</p>
      <p>Have questions? Speak to one of our Rx specialists Monday through Friday, 9am–5pm EST. Call <span className="text-ink">877-245-3721</span> today!</p>
      <p>Not sure which frame fits? Check out our <a href="/rx" className="text-ink underline underline-offset-4">Try Before You Buy</a> program and we&apos;ll send you frames to try on before you order!</p>
    </div>
  );
}

// ── Form vals ─────────────────────────────────────────────────────────────────

type FormVals = {
  tbybId: string;
  depositCents: number | null;
  visionType: string | null;
  odSphere: string | null; odCylinder: string | null; odAxis: string | null;
  osSphere: string | null; osCylinder: string | null; osAxis: string | null;
  pdMode: string;
  pd: string | null; pdLeft: string | null; pdRight: string | null;
  lensMaterial: string | null;
  lensColorCategory: string | null;
  lensColor: string | null;
  arCoating: string | null;
  scratchCoating: string | null;
  mirrorCoating: string | null;
  comments: string;
  rxUrl: string | null; photoUrl: string | null;
  name: string; email: string; phone: string;
};

type UpdateFn = (key: keyof FormVals, value: string | null) => void;

const INIT: FormVals = {
  tbybId: "", depositCents: null,
  visionType: null,
  odSphere: null, odCylinder: null, odAxis: null,
  osSphere: null, osCylinder: null, osAxis: null,
  pdMode: "Single", pd: null, pdLeft: null, pdRight: null,
  lensMaterial: null,
  lensColorCategory: null,
  lensColor: null,
  arCoating: null, scratchCoating: null, mirrorCoating: null,
  comments: "", rxUrl: null, photoUrl: null,
  name: "", email: "", phone: "",
};

// ── Step 0: TBYB order # (optional) ──────────────────────────────────────────

function Step0({ vals, update }: { vals: FormVals; update: UpdateFn }) {
  return (
    <div>
      <h2 className="text-[21px] font-normal mb-3">Did You Complete Try Before You Buy Before This?</h2>
      <p className="text-[15px] text-grey-500 mb-6 leading-relaxed">If so, enter your order # and we&apos;ll apply your deposit to this order. If not, don&apos;t worry — just continue.</p>
      <div>
        <label className="text-[13px] text-grey-500 mb-1.5 block">Order #</label>
        <div className="flex items-center border border-grey-300 focus-within:border-ink transition-colors duration-200 h-11">
          <span className="pl-3.5 text-[15px] text-ink select-none">#</span>
          <input type="text" value={vals.tbybId} onChange={e => update("tbybId", e.target.value.trim())}
            placeholder="ABCD1234"
            className="flex-1 pl-0.5 pr-3.5 h-full text-[15px] outline-none placeholder-grey-400" />
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Prescription ──────────────────────────────────────────────────────

function Step1({ vals, update, openId, setOpenId, sphereOpts, frame }: {
  vals: FormVals; update: UpdateFn;
  openId: string | null; setOpenId: (id: string | null) => void;
  sphereOpts: string[]; frame: PrescriptionFrame;
}) {
  function eyeRow(label: string, prefix: "od" | "os") {
    const cylKey = `${prefix}Cylinder` as keyof FormVals;
    const cylVal = vals[cylKey] as string | null;
    const axisDisabled = !cylVal || cylVal === "None";
    return (
      <div className="border-t border-grey-200 pt-6 first:border-t-0 first:pt-0">
        <p className="text-[15px] mb-3">{label}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Sphere</label>
            <Dropdown id={`${prefix}Sphere`} opts={sphereOpts} value={vals[`${prefix}Sphere` as keyof FormVals] as string | null} onChange={v => update(`${prefix}Sphere` as keyof FormVals, v)} openId={openId} setOpenId={setOpenId} />
          </div>
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Cylinder</label>
            <Dropdown id={`${prefix}Cylinder`} opts={sphereOpts} value={cylVal} onChange={v => update(cylKey, v)} openId={openId} setOpenId={setOpenId} />
          </div>
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Axis</label>
            <Dropdown id={`${prefix}Axis`} opts={AXIS_OPTS} value={vals[`${prefix}Axis` as keyof FormVals] as string | null} onChange={v => update(`${prefix}Axis` as keyof FormVals, v)} disabled={axisDisabled} openId={openId} setOpenId={setOpenId} />
          </div>
        </div>
      </div>
    );
  }

  const rxNote = `${frame.rxLow > 0 ? "+" : ""}${frame.rxLow.toFixed(2)} to ${frame.rxHigh > 0 ? "+" : ""}${frame.rxHigh.toFixed(2)}`;

  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Prescription</h2>
      <div>
        <label className="text-[13px] text-grey-500 mb-1.5 block">Select Vision Type</label>
        <Dropdown id="visionType" opts={VISION_TYPES} value={vals.visionType} onChange={v => update("visionType", v)} openId={openId} setOpenId={setOpenId} />
      </div>
      <p className="text-[13px] text-grey-500 mt-8">Sphere and cylinder power for this frame must fall within {rxNote}.</p>
      <div className="space-y-6 mt-3">
        {eyeRow("OD — Right Eye", "od")}
        {eyeRow("OS — Left Eye", "os")}
      </div>
    </div>
  );
}

// ── Step 2: PD ────────────────────────────────────────────────────────────────

function Step2({ vals, update, openId, setOpenId }: { vals: FormVals; update: UpdateFn; openId: string | null; setOpenId: (id: string | null) => void }) {
  const dual = vals.pdMode === "Dual";
  
  return (
    <div>
      <RxInfoBanner />
      <div className="mt-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <label className="text-[13px] text-grey-500 block">PD (Pupillary Distance)</label>
          <label className="flex items-center gap-2 text-[13px] text-grey-600 cursor-pointer select-none">
            <input type="checkbox" checked={dual} onChange={() => update("pdMode", dual ? "Single" : "Dual")}
              className="w-4 h-4 accent-ink" />
            I have 2 numbers for my PD
          </label>
        </div>
        <div className="mt-1.5">
          {dual ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] text-grey-500 mb-1.5 block">PD — Left</label>
                <Dropdown id="pdLeft" opts={PD_DUAL_OPTS} value={vals.pdLeft} onChange={v => update("pdLeft", v)} openId={openId} setOpenId={setOpenId} />
              </div>
              <div>
                <label className="text-[13px] text-grey-500 mb-1.5 block">PD — Right</label>
                <Dropdown id="pdRight" opts={PD_DUAL_OPTS} value={vals.pdRight} onChange={v => update("pdRight", v)} openId={openId} setOpenId={setOpenId} />
              </div>
            </div>
          ) : (
            <Dropdown id="pd" opts={PD_OPTS} value={vals.pd} onChange={v => update("pd", v)} openId={openId} setOpenId={setOpenId} />
          )}
        </div>
        <p className="text-[13px] text-grey-500 mt-3 leading-relaxed">
          The Pupillary Distance, or &ldquo;PD&rdquo;, is the distance between the center of your left pupil and the center of your right pupil. Call your eye doctor or whoever made your glasses last for this number{dual ? "." : <> — or choose &ldquo;None&rdquo; and we&apos;ll follow up.</>}
        </p>
      </div>
    </div>
  );
}

// ── Step 3: Lens material & color ─────────────────────────────────────────────

function Step3({ vals, update, openId, setOpenId }: { vals: FormVals; update: UpdateFn; openId: string | null; setOpenId: (id: string | null) => void }) {
  const cat = vals.lensColorCategory;

  function radioOpt(label: string, opts: string[]) {
    const selected = cat === label;
    return (
      <div>
        <label className="flex items-center gap-2.5 text-[15px] cursor-pointer">
          <input type="radio" name="lensColorCategory" checked={selected} onChange={() => update("lensColorCategory", label)}
            className="w-4 h-4 accent-ink" />
          {label}
        </label>
        {selected && (
          <div className="pl-6 mt-2">
            <Dropdown id="lensColor" opts={opts} value={vals.lensColor} onChange={v => update("lensColor", v)} openId={openId} setOpenId={setOpenId} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Lens Material & Color</h2>
      <div>
        <label className="text-[13px] text-grey-500 mb-1.5 block">Select Lens Material</label>
        <Dropdown id="lensMaterial" opts={LENS_MATERIALS} value={vals.lensMaterial} onChange={v => update("lensMaterial", v)} openId={openId} setOpenId={setOpenId} />
      </div>
      <div className="mt-8">
        <p className="text-[15px] mb-3">Select Lens Color / Type</p>
        <div className="space-y-3">
          {radioOpt("Genuine Transitions", TRANSITIONS_OPTS)}
          {radioOpt("Polarized", POLARIZED_OPTS)}
          {radioOpt("Solid Tinted", TINTED_OPTS)}
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Coatings ──────────────────────────────────────────────────────────

function Step4({ vals, update, openId, setOpenId }: { vals: FormVals; update: UpdateFn; openId: string | null; setOpenId: (id: string | null) => void }) {
  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Coatings</h2>
      <div className="space-y-6">
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Select Anti-Reflective Coating</label>
          <Dropdown id="arCoating" opts={AR_COATING_OPTS} value={vals.arCoating} onChange={v => update("arCoating", v)} openId={openId} setOpenId={setOpenId} />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Select Scratch Coat</label>
          <Dropdown id="scratchCoating" opts={SCRATCH_COAT_OPTS} value={vals.scratchCoating} onChange={v => update("scratchCoating", v)} openId={openId} setOpenId={setOpenId} />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Select Mirror Coat</label>
          <Dropdown id="mirrorCoating" opts={MIRROR_COAT_OPTS} value={vals.mirrorCoating} onChange={v => update("mirrorCoating", v)} openId={openId} setOpenId={setOpenId} />
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Additional info + contact ─────────────────────────────────────────

function Step5({ vals, update, rxUploading, photoUploading, onRxFile, onPhotoFile }: {
  vals: FormVals; update: UpdateFn;
  rxUploading: boolean; photoUploading: boolean;
  onRxFile: (f: File | null) => void; onPhotoFile: (f: File | null) => void;
}) {
  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Additional Info</h2>
      <div className="space-y-5">
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Comments / Special Requests (Optional)</label>
          <textarea rows={4} value={vals.comments} onChange={e => update("comments", e.target.value)}
            placeholder="Anything else we should know?"
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-3 py-2.5 text-[15px] outline-none placeholder-grey-400 resize-none" />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Upload Prescription (Optional)</label>
          <FileUpload id="rxFileFrames" url={vals.rxUrl} uploading={rxUploading} label="Prescription Uploaded" onChange={onRxFile} />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Upload Headshot (Optional)</label>
          <FileUpload id="photoFileFrames" url={vals.photoUrl} uploading={photoUploading} label="Headshot Uploaded" onChange={onPhotoFile} />
        </div>
      </div>

      <h2 className="text-[21px] font-normal mb-6 mt-10">Contact Info</h2>
      <div className="space-y-5">
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Name</label>
          <input type="text" value={vals.name} onChange={e => update("name", e.target.value)}
            placeholder="Your name"
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-3.5 h-11 text-[15px] text-brand outline-none placeholder-grey-400" />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Email</label>
          <input type="text" value={vals.email} onChange={e => update("email", e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-3.5 h-11 text-[15px] text-brand outline-none placeholder-grey-400" />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Phone (Optional)</label>
          <input type="tel" value={vals.phone} onChange={e => update("phone", e.target.value)}
            placeholder="(555) 555-5555"
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-3.5 h-11 text-[15px] outline-none placeholder-grey-400" />
        </div>
      </div>
    </div>
  );
}

// ── Step 6: Review ────────────────────────────────────────────────────────────

function Step6({ vals, frame, color }: { vals: FormVals; frame: PrescriptionFrame; color: PrescriptionFrameColor }) {
  function row(label: string, value: string | null | undefined) {
    return (
      <div className="flex justify-between gap-6 py-2.5 border-b border-grey-100 last:border-0">
        <dt className="text-grey-500">{label}</dt>
        <dd className="text-ink text-right">{value || "None"}</dd>
      </div>
    );
  }

  function rowLink(label: string, url: string | null, linkLabel: string) {
    return (
      <div className="flex justify-between gap-6 py-2.5 border-b border-grey-100 last:border-0">
        <dt className="text-grey-500">{label}</dt>
        <dd className="text-right">
          {url
            ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4">{linkLabel}</a>
            : <span className="text-ink">None</span>}
        </dd>
      </div>
    );
  }

  function section(title: string, children: React.ReactNode) {
    return (
      <div className="border-t border-grey-200 pt-6 first:border-t-0 first:pt-0">
        <p className="text-[15px] mb-1">{title}</p>
        <dl className="text-[13px]">{children}</dl>
      </div>
    );
  }

  const pdRows = vals.pdMode === "Dual"
    ? <>{row("PD — Left", vals.pdLeft)}{row("PD — Right", vals.pdRight)}</>
    : <>{row("PD", vals.pd)}</>;


  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Confirm Your Details</h2>
      <div className="space-y-6">
        {section("Frame",
          <>{row("Selected", `${frame.name} — ${color.option} — $${(frame.priceCents / 100).toFixed(0)}`)}</>
        )}
        {section("Prescription",
          <>
            {row("Vision Type", vals.visionType)}
            {row("OD Sphere", vals.odSphere)}{row("OD Cylinder", vals.odCylinder)}{row("OD Axis", vals.odAxis)}
            {row("OS Sphere", vals.osSphere)}{row("OS Cylinder", vals.osCylinder)}{row("OS Axis", vals.osAxis)}
          </>
        )}
        {section("PD", pdRows)}
        {section("Lens",
          <>{row("Material", vals.lensMaterial)}{row("Color / Type", `${vals.lensColorCategory} · ${vals.lensColor}`)}</>
        )}
        {section("Coatings",
          <>{row("Anti-Reflective", vals.arCoating)}{row("Scratch Coat", vals.scratchCoating)}{row("Mirror Coat", vals.mirrorCoating)}</>
        )}
        {section("Additional Info",
          <>{row("Comments", vals.comments)}{rowLink("Prescription File", vals.rxUrl, "Prescription Uploaded")}{rowLink("Head Shot Photo", vals.photoUrl, "Headshot Uploaded")}</>
        )}
        {section("Contact Info",
          <>{row("Name", vals.name)}{row("Email", vals.email)}{row("Phone", vals.phone)}</>
        )}
      </div>
      <p className="text-[13px] text-grey-500 leading-relaxed mt-8">Double-check everything above, then submit. You can go back to fix anything first.</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PrescriptionFramesClient({ frames, email, name }: { frames: PrescriptionFrame[]; email: string; name: string }) {
  const [selectedFrame, setSelectedFrame] = useState<PrescriptionFrame | null>(null);
  const [pendingColor, setPendingColor] = useState<{ frameId: string; colorSlug: string } | null>(null);
  const [hoveredColor, setHoveredColor] = useState<{ frameId: string; colorSlug: string } | null>(null);
  const [step, setStep] = useState<number>(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [vals, setVals] = useState<FormVals>({ ...INIT, email, name });
  const [rxUploading, setRxUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [depositFetching, setDepositFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${brandSlug}:rx`);
      if (!stored) return;

      const { frameId, frameColor, step: savedStep, vals: savedVals } = JSON.parse(stored);

      const mergedVals: FormVals = { ...vals, ...(savedVals ?? {}) };

      if (typeof savedStep === "number") setStep(savedStep);
      setVals(mergedVals);

      const frame = frames.find(f => f.id === frameId);
      if (!frame) return;

      const color = frame.colors.find(c => c.slug === frameColor);
      if (!color) {
        saveToLS(savedStep ?? 0, null, null, mergedVals);
        return;
      }

      setPendingColor({ frameId: frame.id, colorSlug: color.slug });
      setSelectedFrame(frame);
    } catch {}
  }, []);

  function saveToLS(toStep: number, frameId: string | null, frameColor: string | null, values: FormVals) {
    try {
      const { name: _name, email: _email, ...serializableVals } = values;

      localStorage.setItem(`${brandSlug}:rx`, JSON.stringify({ frameId, frameColor, step: toStep, vals: serializableVals }));
    } catch {}
  }

  function update(key: keyof FormVals, value: string | null) {
    setVals(prev => {
      const next = { ...prev, [key]: value } as FormVals;
      if (key === "tbybId") next.depositCents = null;
      if (key === "odCylinder" && value === "None") next.odAxis = null;
      if (key === "osCylinder" && value === "None") next.osAxis = null;
      if (key === "lensColorCategory") next.lensColor = null;
      if (key === "pdMode" && value === "Single") { next.pdLeft = null; next.pdRight = null; }
      if (key === "pdMode" && value === "Dual") next.pd = null;
      return next;
    });
  }

  async function handleRxFile(f: File | null) {
    if (!f) { update("rxUrl", null); return; }

    setRxUploading(true);
    try {
      const fd = new FormData(); fd.append("file", f); fd.append("folder", "rx");
      const r = await uploadFile(fd);
      update("rxUrl", r.url);
    } catch {
      setError("Prescription upload failed!");
    } finally {
      setRxUploading(false);
    }
  }

  async function handlePhotoFile(f: File | null) {
    if (!f) { update("photoUrl", null); return; }
    
    setPhotoUploading(true);
    try {
      const fd = new FormData(); fd.append("file", f); fd.append("folder", "rx");
      const r = await uploadFile(fd);
      update("photoUrl", r.url);
    } catch {
      setError("Headshot upload failed!");
    } finally {
      setPhotoUploading(false);
    }
  }

  useEffect(() => {
    if (selectedFrame && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedFrame]);

  function selectFrame(frame: PrescriptionFrame) {
    if (!email || !name) { router.push("/sign-in"); return; }

    if (selectedFrame?.id === frame.id) {
      setSelectedFrame(null);
      saveToLS(step, null, null, vals);
      return;
    }
    
    const opts = sphereOptsForRange(frame.rxLow, frame.rxHigh);
    const hasConflict = (vals.odSphere && !opts.includes(vals.odSphere)) || (vals.odCylinder && !opts.includes(vals.odCylinder)) || (vals.osSphere && !opts.includes(vals.osSphere)) || (vals.osCylinder && !opts.includes(vals.osCylinder));
    const nextVals = hasConflict
      ? { ...vals, odSphere: null, odCylinder: null, odAxis: null, osSphere: null, osCylinder: null, osAxis: null }
      : vals;
      
    const nextStep = hasConflict ? 1 : step;

    setVals(nextVals);
    setStep(nextStep);
    setSelectedFrame(frame);
    saveToLS(nextStep, frame.id, pendingColor!.colorSlug, nextVals);
    setError(null);
  }

  async function handleNext() {
    setError(null);

    if (step === 0) {
      let nextVals = vals;

      if (vals.tbybId && vals.tbybId.length !== 8) {
        setError("Submission ID must be 8 characters.");
        return;
      }

      if (vals.tbybId) {
        setDepositFetching(true);

        try {
          const { depositCents: deposit } = await getDeposit(vals.tbybId);

          if (deposit <= 0) {
            setError("No deposit remaining on that submission.");
            setDepositFetching(false);
            return;
          }
          
          nextVals = { ...vals, depositCents: deposit };
          setVals(nextVals);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not find that submission.");
          setDepositFetching(false);
          return;
        }

        setDepositFetching(false);
      }

      saveToLS(step + 1, selectedFrame!.id, pendingColor!.colorSlug, nextVals);
      setStep(s => s + 1);
      return;
    }

    if (step === 1) {
      if (!vals.visionType)  { setError("Please select a vision type!"); return; }
      if (!vals.odSphere)    { setError("Please select your right eye (OD) sphere!"); return; }
      if (!vals.odCylinder)  { setError("Please select your right eye (OD) cylinder!"); return; }
      if (vals.odCylinder !== "None" && !vals.odAxis) { setError("Please select your right eye (OD) axis!"); return; }
      if (!vals.osSphere)    { setError("Please select your left eye (OS) sphere!"); return; }
      if (!vals.osCylinder)  { setError("Please select your left eye (OS) cylinder!"); return; }
      if (vals.osCylinder !== "None" && !vals.osAxis) { setError("Please select your left eye (OS) axis!"); return; }
      saveToLS(step + 1, selectedFrame!.id, pendingColor!.colorSlug, vals);
      setStep(s => s + 1);
      return;
    }

    if (step === 2) {
      if (vals.pdMode === "Single" && !vals.pd)    { setError("Please select your PD!"); return; }
      if (vals.pdMode === "Dual" && !vals.pdRight) { setError("Please select your right PD!"); return; }
      if (vals.pdMode === "Dual" && !vals.pdLeft)  { setError("Please select your left PD!"); return; }
      saveToLS(step + 1, selectedFrame!.id, pendingColor!.colorSlug, vals);
      setStep(s => s + 1);
      return;
    }

    if (step === 3) {
      if (!vals.lensMaterial) { setError("Please select a lens material!"); return; }
      if (!vals.lensColorCategory) { setError("Please select a lens color/type!"); return; }
      if (!vals.lensColor) { setError("Please select a lens color/type option!"); return; }
      saveToLS(step + 1, selectedFrame!.id, pendingColor!.colorSlug, vals);
      setStep(s => s + 1);
      return;
    }

    if (step === 4) {
      if (!vals.arCoating)      { setError("Please select an anti-reflective coating!"); return; }
      if (!vals.scratchCoating) { setError("Please select a scratch coat!"); return; }
      if (!vals.mirrorCoating)  { setError("Please select a mirror coat!"); return; }
      saveToLS(step + 1, selectedFrame!.id, pendingColor!.colorSlug, vals);
      setStep(s => s + 1);
      return;
    }

    if (step === 5) {
      if (!vals.name.trim())  { setError("Name is required!"); return; }
      if (!vals.email.trim()) { setError("Email is required!"); return; }
      saveToLS(step + 1, selectedFrame!.id, pendingColor!.colorSlug, vals);
      setStep(s => s + 1);
      return;
    }

    // step === 6: submit
    setSubmitting(true);
    try {
      const submission: RxFrameSubmission = {
        frameId: selectedFrame!.id,
        frameColorSlug: pendingColor!.colorSlug,
        tbybSubmissionId: vals.tbybId || null,
        depositCents: vals.depositCents,
        visionType: vals.visionType!,
        odSphere: vals.odSphere!, odCylinder: vals.odCylinder!, odAxis: vals.odAxis || "None",
        osSphere: vals.osSphere!, osCylinder: vals.osCylinder!, osAxis: vals.osAxis || "None",
        pdMode: vals.pdMode, pd: vals.pd || "None", pdLeft: vals.pdLeft || "None", pdRight: vals.pdRight || "None",
        lensMaterial: vals.lensMaterial!, lensColorCategory: vals.lensColorCategory!, lensColor: vals.lensColor!,
        arCoating: vals.arCoating!, scratchCoating: vals.scratchCoating!, mirrorCoating: vals.mirrorCoating!,
        comments: vals.comments || "None",
        prescriptionUrl: vals.rxUrl || "None", headshotUrl: vals.photoUrl || "None",
        name: vals.name, email: vals.email, phone: vals.phone || "None",
      };

      const result = await submitRxOrder(
        submission,
        `${window.location.origin}/rx/success`,
        `${window.location.origin}/rx?tab=frames`,
      );

      if ("data" in result) {
        const { depositCents: freshDeposit } = result.data;

        if (freshDeposit <= 0) {
          const nextVals = { ...vals, tbybId: "", depositCents: null };
          setVals(nextVals);
          saveToLS(step, selectedFrame!.id, pendingColor!.colorSlug, nextVals);
          setError("Your deposit has been fully used. Resubmit to continue without it.");
        } else {
          const nextVals = { ...vals, depositCents: freshDeposit };
          setVals(nextVals);
          saveToLS(step, selectedFrame!.id, pendingColor!.colorSlug, nextVals);
          setError(`Deposit has changed to $${(freshDeposit / 100).toFixed(2)}. Please review and resubmit.`);
        }
        
        setSubmitting(false);
        return;
      }

      router.push(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  const selectedColor = selectedFrame?.colors.find(c => c.slug === pendingColor!.colorSlug) ?? null;
  const sphereOpts = selectedFrame ? sphereOptsForRange(selectedFrame.rxLow, selectedFrame.rxHigh) : [];
  const busy = submitting || rxUploading || photoUploading || depositFetching;

  return (
    <>
      {/* Frame grid */}
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-9 lg:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {frames.map(frame => {
            const isSelected = selectedFrame?.id === frame.id;
            const isPendingFrame = pendingColor?.frameId === frame.id;
            const isHoveredFrame = hoveredColor?.frameId === frame.id;

            const displayColorName = isHoveredFrame
              ? frame.colors.find(c => c.slug === hoveredColor.colorSlug)?.option
              : isPendingFrame
              ? frame.colors.find(c => c.slug === pendingColor.colorSlug)?.option
              : undefined;

            return (
              <div key={frame.id} className={`border p-6 flex flex-col transition-colors duration-200 ${isSelected ? "border-ink" : "border-grey-200 hover:border-grey-300"}`}>
                <div className="h-40 flex items-center justify-center bg-grey-50">
                  <img src={frame.imageSrc} alt={frame.name} className="max-h-36 max-w-[80%] object-contain mix-blend-multiply" />
                </div>
                <div className="flex items-baseline justify-between gap-3 mt-4">
                  <p className="text-[18px]">{frame.name}</p>
                  <p className="text-[18px]">${(frame.priceCents / 100).toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-2.5 mt-3">
                  {frame.colors.map(c => {
                    const isChosen = isPendingFrame && pendingColor!.colorSlug === c.slug;

                    return (
                      <button key={c.slug} type="button"
                        disabled={busy}
                        onClick={() => {
                          setSelectedFrame(null);
                          if (isChosen) { setPendingColor(null); saveToLS(step, null, null, vals); return; }
                          setPendingColor({ frameId: frame.id, colorSlug: c.slug });
                        }}
                        onMouseEnter={() => setHoveredColor({ frameId: frame.id, colorSlug: c.slug })}
                        onMouseLeave={() => setHoveredColor(null)}
                        className={`w-5 h-5 rounded-full border border-grey-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${isChosen ? "ring-[1.5px] ring-ink ring-offset-1" : "hover:ring-[1.5px] hover:ring-ink hover:ring-offset-1"}`}
                        style={{ backgroundColor: c.value }}
                      />
                    );
                  })}
                </div>
                <p className="text-[13px] text-grey-400 mt-2">{displayColorName ?? "Select a color"}</p>
                <p className="text-[13px] text-grey-500 mt-3">Size: {frame.size}</p>
                <p className="text-[13px] text-grey-500 mt-1">Range: {frame.rxLow > 0 ? "+" : ""}{frame.rxLow.toFixed(2)} to {frame.rxHigh > 0 ? "+" : ""}{frame.rxHigh.toFixed(2)}</p>
                <button type="button" onClick={() => selectFrame(frame)}
                  disabled={!isPendingFrame || busy}
                  className={`mt-6 border border-ink text-[15px] py-3 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isSelected ? "bg-ink text-paper" : isPendingFrame ? "hover:bg-ink hover:text-paper" : ""}`}>
                  {isSelected ? "Selected" : "Select Frame"}
                </button>
              </div>
            );
          })}
        </div>
        <div ref={formRef} />
      </section>

      {/* Form region */}
      {selectedFrame && (
        <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-16">
          <div className="max-w-[640px] mx-auto border-t border-grey-200 pt-12">
            {step >= 1 && <StepDots step={step} />}
            <p className="text-[13px] text-grey-500 text-center mb-3">
              Selected: <span className="text-ink">{selectedFrame.name} — {selectedColor!.option} — ${(selectedFrame.priceCents / 100).toFixed(0)}</span>
            </p>
            {vals.depositCents !== null && step >= 1 && (
              <p className="text-[13px] text-brand text-center mb-8">
                ✓ ${(vals.depositCents / 100).toFixed(2)} deposit applied from order #{vals.tbybId}
              </p>
            )}
            {step === 0 && <Step0 vals={vals} update={update} />}
            {step === 1 && <Step1 vals={vals} update={update} openId={openId} setOpenId={setOpenId} sphereOpts={sphereOpts} frame={selectedFrame} />}
            {step === 2 && <Step2 vals={vals} update={update} openId={openId} setOpenId={setOpenId} />}
            {step === 3 && <Step3 vals={vals} update={update} openId={openId} setOpenId={setOpenId} />}
            {step === 4 && <Step4 vals={vals} update={update} openId={openId} setOpenId={setOpenId} />}
            {step === 5 && <Step5 vals={vals} update={update} rxUploading={rxUploading} photoUploading={photoUploading} onRxFile={handleRxFile} onPhotoFile={handlePhotoFile} />}
            {step === 6 && <Step6 vals={vals} frame={selectedFrame} color={selectedColor!} />}
            {error && (
              <div className="flex items-start gap-2.5 border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3 mt-6">
                <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
                <span>{error}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-6">
              <button type="button"
                onClick={() => { setStep(s => s - 1); setError(null); }}
                disabled={busy}
                className={`text-[15px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200 disabled:opacity-30 ${step === 0 ? "invisible" : ""}`}>
                Back
              </button>
              <button type="button" onClick={handleNext} disabled={busy}
                className="bg-ink text-paper text-[15px] px-9 py-3.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50">
                {submitting ? "Submitting…" : depositFetching ? "Checking…" : step === 6 ? "Submit" : step === 5 ? "Review" : "Continue"}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
