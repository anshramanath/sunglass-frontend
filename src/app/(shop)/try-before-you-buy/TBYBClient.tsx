"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import type { TBYBPackage } from "@/lib/types";
import { submitTBYB, uploadFile } from "@/lib/api";

// ── Option generators ─────────────────────────────────────────────────────────

type Opt = { value: string; label: string };

const SPHERE_OPTS: Opt[] = (() => {
  const opts: Opt[] = [];
  for (let i = -80; i <= -1; i++) { const l = (i * 0.25).toFixed(2); opts.push({ value: l, label: l }); }
  opts.push({ value: "plano", label: "None" });
  for (let i = 1; i <= 80; i++) { const l = "+" + (i * 0.25).toFixed(2); opts.push({ value: l, label: l }); }
  return opts;
})();

const CYLINDER_OPTS: Opt[] = (() => {
  const opts: Opt[] = [];
  for (let i = -24; i <= -1; i++) { const l = (i * 0.25).toFixed(2); opts.push({ value: l, label: l }); }
  opts.push({ value: "plano", label: "None" });
  for (let i = 1; i <= 24; i++) { const l = "+" + (i * 0.25).toFixed(2); opts.push({ value: l, label: l }); }
  return opts;
})();

const AXIS_OPTS: Opt[] = Array.from({ length: 180 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}°` }));

const HAT_OPTS: Opt[] = [
  ...["5","5¼","5½","5¾","6","6⅛","6¼","6⅜","6½","6⅝","6¾","6⅞","7","7⅛","7¼","7⅜","7½","7⅝","7¾","7⅞","8","8¼","8½","8¾","9"].map(s => ({ value: s, label: s })),
  { value: "unknown", label: "I don't know" },
];

const lo = (arr: string[]): Opt[] => arr.map(s => ({ value: s, label: s }));

// ── Dropdown ──────────────────────────────────────────────────────────────────

function Dropdown({ id, opts, value, onChange, disabled, openId, setOpenId }: {
  id: string; opts: Opt[]; value: string | null; onChange: (v: string) => void;
  disabled?: boolean; openId: string | null; setOpenId: (id: string | null) => void;
}) {
  const isOpen = openId === id && !disabled;
  const label = disabled ? "—" : (opts.find(o => o.value === value)?.label ?? "Select");

  return (
    <div data-dd className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpenId(isOpen ? null : id)}
        className="w-full flex items-center justify-between gap-2 border border-grey-300 hover:border-ink disabled:hover:border-grey-300 disabled:text-grey-400 disabled:bg-grey-50 transition-colors duration-200 px-3.5 h-11 text-[15px] text-left bg-paper"
      >
        <span className="truncate">{label}</span>
        <svg className="w-4 h-4 text-grey-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 bg-paper border border-grey-300 shadow-pop max-h-64 overflow-y-auto">
          {opts.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpenId(null); }}
              className="w-full text-left px-3.5 py-2.5 text-[15px] hover:bg-grey-50 transition-colors duration-200">
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── File upload ───────────────────────────────────────────────────────────────

function FileUpload({ id, file, onChange }: { id: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div>
      <input id={id} type="file" className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
      <label htmlFor={id} className="flex items-center gap-3 border border-dashed border-grey-300 hover:border-ink transition-colors duration-200 px-4 h-14 cursor-pointer">
        <svg className="w-5 h-5 text-grey-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 16V4M12 4 7 9M12 4l5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        {file
          ? <span className="text-[15px] text-ink truncate">{file.name}</span>
          : <span className="text-[15px] text-grey-500">Browse a file</span>
        }
      </label>
      {file && (
        <button type="button" onClick={() => onChange(null)}
          className="mt-1 text-[13px] text-grey-400 hover:text-ink underline underline-offset-4 transition-colors duration-200">
          Remove
        </button>
      )}
    </div>
  );
}

// ── Step dots ─────────────────────────────────────────────────────────────────

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {[1, 2, 3].map((n, i) => (
        <Fragment key={n}>
          <span className={`text-[13px] w-7 h-7 rounded-full grid place-items-center border ${n <= step ? "border-brand bg-brand text-paper" : "border-grey-300 text-grey-500"}`}>
            {n}
          </span>
          {i < 2 && <span className={`w-8 h-px ${n < step ? "bg-brand" : "bg-grey-300"}`} />}
        </Fragment>
      ))}
    </div>
  );
}

// ── Form values ───────────────────────────────────────────────────────────────

type FormVals = {
  odSphere: string | null; odCylinder: string | null; odAxis: string | null;
  osSphere: string | null; osCylinder: string | null; osAxis: string | null;
  lensType: string | null; helmetSize: string | null; hatSize: string | null;
  noseBridge: string | null; sunglassFit: string | null; frameType: string | null;
  comments: string; email: string; phone: string;
  rxFile: File | null; photoFile: File | null;
};

type UpdateFn = (key: keyof FormVals, value: string | null | File) => void;

// ── Step 1: Prescription ──────────────────────────────────────────────────────

function Step1({ vals, update, openId, setOpenId }: { vals: FormVals; update: UpdateFn; openId: string | null; setOpenId: (id: string | null) => void }) {
  function eyeRow(label: string, prefix: "od" | "os") {
    const cylKey = `${prefix}Cylinder` as keyof FormVals;
    const cylVal = vals[cylKey] as string | null;
    const axisDisabled = !cylVal || cylVal === "plano";
    return (
      <div className="border-t border-grey-200 pt-6 first:border-t-0 first:pt-0">
        <p className="text-[15px] mb-3">{label}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Sphere</label>
            <Dropdown id={`${prefix}Sphere`} opts={SPHERE_OPTS} value={vals[`${prefix}Sphere` as keyof FormVals] as string | null} onChange={v => update(`${prefix}Sphere` as keyof FormVals, v)} openId={openId} setOpenId={setOpenId} />
          </div>
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Cylinder</label>
            <Dropdown id={`${prefix}Cylinder`} opts={CYLINDER_OPTS} value={cylVal} onChange={v => update(cylKey, v)} openId={openId} setOpenId={setOpenId} />
          </div>
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Axis</label>
            <Dropdown id={`${prefix}Axis`} opts={AXIS_OPTS} value={axisDisabled ? null : vals[`${prefix}Axis` as keyof FormVals] as string | null} onChange={v => update(`${prefix}Axis` as keyof FormVals, v)} disabled={axisDisabled} openId={openId} setOpenId={setOpenId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Prescription</h2>
      <div className="space-y-6">
        {eyeRow("OD — Right Eye", "od")}
        {eyeRow("OS — Left Eye", "os")}
      </div>
    </div>
  );
}

// ── Step 2: Fitting questions ─────────────────────────────────────────────────

function Step2({ vals, update, openId, setOpenId }: { vals: FormVals; update: UpdateFn; openId: string | null; setOpenId: (id: string | null) => void }) {
  function field(key: keyof FormVals, label: string, opts: Opt[]) {
    return (
      <div>
        <label className="text-[13px] text-grey-500 mb-1.5 block">{label}</label>
        <Dropdown id={String(key)} opts={opts} value={vals[key] as string | null} onChange={v => update(key, v)} openId={openId} setOpenId={setOpenId} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Fitting Questions</h2>
      <div className="space-y-5">
        {field("lensType",    "Lens Type Desired",      lo(["Single Vision", "Bifocals", "Progressive (no line bifocals)"]))}
        {field("helmetSize",  "Helmet Size",             lo(["XSmall", "Small", "Medium", "Large", "XLarge", "XXLarge", "XXXLarge"]))}
        {field("hatSize",     "Hat Size",                HAT_OPTS)}
        {field("noseBridge",  "Describe Nose Bridge",   lo(["It's small and petite", "It's thin and narrow", "It's higher or taller", "It's wider and larger", "It's lower or flatter", "Nothing unique — it's pretty normal looking"]))}
        {field("sunglassFit", "When buying sunglasses", lo(["All styles and sizes fit me", "I have to select larger, wider frames", "I have to select smaller frames", "Most lenses touch my eyelashes", "I have to buy sunglasses with floating nose pieces", "I've never bought sunglasses"]))}
        {field("frameType",   "Type of frame you prefer", lo(["With Foam Cushion", "Without Foam Cushion", "Removable Foam Cushion", "Goggles with Strap", "Cover Overs"]))}
      </div>
    </div>
  );
}

// ── Step 3: Additional info ───────────────────────────────────────────────────

function Step3({ vals, update }: { vals: FormVals; update: UpdateFn }) {
  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Additional Info</h2>
      <div className="space-y-5">
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Comments / special requests</label>
          <textarea rows={4} value={vals.comments} onChange={e => update("comments", e.target.value)}
            placeholder="Anything else we should know?"
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-3 py-2.5 text-[15px] outline-none placeholder-grey-400 resize-none" />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Upload prescription</label>
          <FileUpload id="rxFile" file={vals.rxFile} onChange={f => update("rxFile", f)} />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Upload head shot photo</label>
          <FileUpload id="photoFile" file={vals.photoFile} onChange={f => update("photoFile", f)} />
        </div>
      </div>

      <h2 className="text-[21px] font-normal mb-6 mt-10">Contact Info</h2>
      <div className="space-y-5">
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Email</label>
          <input type="text" value={vals.email} onChange={e => update("email", e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-3.5 h-11 text-[15px] outline-none placeholder-grey-400" />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Phone (optional)</label>
          <input type="tel" value={vals.phone} onChange={e => update("phone", e.target.value)}
            placeholder="(555) 555-5555"
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-3.5 h-11 text-[15px] outline-none placeholder-grey-400" />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const INIT: FormVals = {
  odSphere: null, odCylinder: null, odAxis: null,
  osSphere: null, osCylinder: null, osAxis: null,
  lensType: null, helmetSize: null, hatSize: null,
  noseBridge: null, sunglassFit: null, frameType: null,
  comments: "", email: "", phone: "",
  rxFile: null, photoFile: null,
};

export default function TBYBClient({ packages, userEmail }: { packages: TBYBPackage[]; userEmail?: string }) {
  const [selectedPkg, setSelectedPkg] = useState<TBYBPackage | null>(null);
  const [step, setStep] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [vals, setVals] = useState<FormVals>({ ...INIT, email: userEmail ?? "" });
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!(e.target as Element).closest("[data-dd]")) setOpenId(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function update(key: keyof FormVals, value: string | null | File) {
    setVals(prev => {
      const next = { ...prev, [key]: value };
      if (key === "odCylinder" && value === "plano") next.odAxis = null;
      if (key === "osCylinder" && value === "plano") next.osAxis = null;
      return next;
    });
  }

  function selectPkg(pkg: TBYBPackage) {
    if (!userEmail) { router.push("/sign-in"); return; }
    setSelectedPkg(pkg);
    setStep(1);
    setSubmitted(false);
    setError(null);
    setTimeout(() => {
      if (formRef.current) {
        const top = formRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  }

  async function handleNext() {
    if (step < 3) { setStep(s => s + 1); return; }
    if (!vals.email.trim()) { setError("Email is required."); return; }
    setError(null);
    setIsPending(true);
    try {
      const toFd = (file: File) => { const fd = new FormData(); fd.append("file", file); return fd; };
      const [rxResult, photoResult] = await Promise.all([
        vals.rxFile    ? uploadFile(toFd(vals.rxFile))    : Promise.resolve(null),
        vals.photoFile ? uploadFile(toFd(vals.photoFile)) : Promise.resolve(null),
      ]);

      await submitTBYB({
        packageId: selectedPkg!.id,
        odSphere: vals.odSphere, odCylinder: vals.odCylinder, odAxis: vals.odAxis,
        osSphere: vals.osSphere, osCylinder: vals.osCylinder, osAxis: vals.osAxis,
        lensType: vals.lensType, helmetSize: vals.helmetSize, hatSize: vals.hatSize,
        noseBridge: vals.noseBridge, sunglassFit: vals.sunglassFit, frameType: vals.frameType,
        comments: vals.comments, email: vals.email, phone: vals.phone,
        prescriptionUrl: rxResult?.url ?? null,
        headshotUrl: photoResult?.url ?? null,
      });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setIsPending(false);
  }

  return (
    <>
      {/* Package grid */}
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-9 lg:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {packages.map(pkg => {
            const isSelected = selectedPkg?.id === pkg.id;
            const pairsLabel = pkg.pairsMin === pkg.pairsMax ? `${pkg.pairsMin} pairs` : `${pkg.pairsMin}–${pkg.pairsMax} pairs`;
            return (
              <div key={pkg.id} className={`group/pkg relative border p-6 flex flex-col transition-colors duration-200 ${isSelected ? "border-ink" : "border-grey-200 hover:border-grey-300"}`}>
                <div className="h-16 flex items-center">
                  <img src={pkg.imageSrc} alt={pkg.brands.join(", ")} className="max-h-16 max-w-[70%] object-contain" />
                </div>
                <p className="text-[18px] mt-4">{pkg.name}</p>
                <p className="text-[13px] text-grey-500 mt-1">{pairsLabel}</p>
                <p className="text-[13px] text-grey-400 mt-1 max-h-0 opacity-0 group-hover/pkg:max-h-8 group-hover/pkg:opacity-100 overflow-hidden transition-all duration-200">
                  Includes: {pkg.brands.join(", ")}
                </p>
                <p className="text-[26px] mt-5">${(pkg.priceCents / 100).toFixed(0)}<span className="text-[13px] text-grey-500"> deposit</span></p>
                <button type="button" onClick={() => selectPkg(pkg)}
                  className={`mt-6 border text-[15px] py-3 transition-colors duration-200 ${isSelected ? "border-ink bg-ink text-paper" : "border-ink hover:bg-ink hover:text-paper"}`}>
                  {isSelected ? "Selected" : "Select Package"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Form region */}
      {selectedPkg && (
        <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-16">
          <div ref={formRef} className="max-w-[640px] mx-auto border-t border-grey-200 pt-12">
            {submitted ? (
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#22963F] grid place-items-center">
                  <svg className="w-8 h-8 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-[21px] font-normal mt-6">Request submitted</h2>
                <p className="text-[15px] text-grey-600 leading-relaxed mt-3">
                  Your <span className="text-ink">{selectedPkg.name}</span> try-on request is in. We'll reach out to confirm details before shipping your frames.
                </p>
              </div>
            ) : (
              <>
                <StepDots step={step} />
                <p className="text-[13px] text-grey-500 text-center mb-8">
                  Selected: <span className="text-ink">{selectedPkg.name} — ${(selectedPkg.priceCents / 100).toFixed(0)} deposit</span>
                </p>
                {step === 1 && <Step1 vals={vals} update={update} openId={openId} setOpenId={setOpenId} />}
                {step === 2 && <Step2 vals={vals} update={update} openId={openId} setOpenId={setOpenId} />}
                {step === 3 && <Step3 vals={vals} update={update} />}
                {error && <p className="text-[13px] text-brand mt-4">{error}</p>}
                <div className="flex items-center justify-between mt-10">
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className={`text-[15px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200 ${step === 1 ? "invisible" : ""}`}>
                    Back
                  </button>
                  <button type="button" onClick={handleNext} disabled={isPending}
                    className="bg-ink text-paper text-[15px] px-9 py-3.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50">
                    {isPending ? "Submitting…" : step === 3 ? "Submit" : "Continue"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
