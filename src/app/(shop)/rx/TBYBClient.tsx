"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import type { TBYBPackage } from "@/lib/types";
import { submitTBYB, uploadFile } from "@/lib/api";
import { getBrand } from "@/lib/brand";

const brandSlug = getBrand().slug;

// ── Option generators ─────────────────────────────────────────────────────────

const SPHERE_OPTS: string[] = (() => {
  const opts: string[] = [];
  for (let i = 32; i >= 1; i--) { opts.push("+" + (i * 0.25).toFixed(2)); }
  opts.push("None");
  for (let i = -1; i >= -32; i--) { opts.push((i * 0.25).toFixed(2)); }
  return opts;
})();

const CYLINDER_OPTS: string[] = (() => {
  const opts: string[] = [];
  for (let i = 32; i >= 1; i--) { opts.push("+" + (i * 0.25).toFixed(2)); }
  opts.push("None");
  for (let i = -1; i >= -32; i--) { opts.push((i * 0.25).toFixed(2)); }
  return opts;
})();

const AXIS_OPTS: string[] = Array.from({ length: 180 }, (_, i) => `${i + 1}°`);

const HAT_OPTS: string[] = ["5","5¼","5½","5¾","6","6⅛","6¼","6⅜","6½","6⅝","6¾","6⅞","7","7⅛","7¼","7⅜","7½","7⅝","7¾","7⅞","8","8¼","8½","8¾","9","Not sure"];

// ── Dropdown ──────────────────────────────────────────────────────────────────

function Dropdown({ id, opts, value, onChange, disabled, openId, setOpenId }: {
  id: string; opts: string[]; value: string | null; onChange: (v: string) => void;
  disabled?: boolean; openId: string | null; setOpenId: (id: string | null) => void;
}) {
  const isOpen = openId === id && !disabled;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpenId(isOpen ? null : id)}
        className="w-full flex items-center justify-between gap-2 border border-grey-300 hover:border-ink disabled:hover:border-grey-300 disabled:text-grey-400 disabled:bg-grey-50 transition-colors duration-200 px-3.5 h-11 text-[15px] text-left bg-paper"
      >
        <span className="truncate">{disabled ? "—" : (value ?? "Select")}</span>
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
                {o}
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
          <svg className="w-5 h-5 text-ink shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
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
              className="text-[15px] text-ink underline underline-offset-4 truncate">
              {label}
            </a>
            <button type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onChange(null); }}
              className="shrink-0 text-[13px] text-grey-400 hover:text-ink underline underline-offset-4 transition-colors duration-200">
              Remove
            </button>
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
    <div className={`flex items-center justify-center gap-3 mb-10 ${step === 4 ? "opacity-30" : ""}`}>
      {[1, 2, 3].map(n => (
        <Fragment key={n}>
          <span className={`text-[13px] w-7 h-7 rounded-full grid place-items-center border ${n <= step ? "border-brand bg-brand text-paper" : "border-grey-300 text-grey-500"}`}>
            {n}
          </span>
          {n < 3 && <span className={`w-8 h-px ${n < step ? "bg-brand" : "bg-grey-300"}`} />}
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
  comments: string; name: string; email: string; phone: string;
  rxUrl: string | null; photoUrl: string | null;
};

type UpdateFn = (key: keyof FormVals, value: string | null) => void;

// ── Step 1: Prescription ──────────────────────────────────────────────────────

function Step1({ vals, update, openId, setOpenId }: { vals: FormVals; update: UpdateFn; openId: string | null; setOpenId: (id: string | null) => void }) {
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
            <Dropdown id={`${prefix}Sphere`} opts={SPHERE_OPTS} value={vals[`${prefix}Sphere` as keyof FormVals] as string | null} onChange={v => update(`${prefix}Sphere` as keyof FormVals, v)} openId={openId} setOpenId={setOpenId} />
          </div>
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Cylinder</label>
            <Dropdown id={`${prefix}Cylinder`} opts={CYLINDER_OPTS} value={cylVal} onChange={v => update(cylKey, v)} openId={openId} setOpenId={setOpenId} />
          </div>
          <div>
            <label className="text-[13px] text-grey-500 mb-1.5 block">Axis</label>
            <Dropdown id={`${prefix}Axis`} opts={AXIS_OPTS} value={vals[`${prefix}Axis` as keyof FormVals] as string | null} onChange={v => update(`${prefix}Axis` as keyof FormVals, v)} disabled={axisDisabled} openId={openId} setOpenId={setOpenId} />
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
  function field(key: keyof FormVals, label: string, opts: string[]) {
    return (
      <div>
        <label className="text-[13px] text-grey-500 mb-1.5 block">{label}</label>
        <Dropdown id={key} opts={opts} value={vals[key] as string | null} onChange={v => update(key, v)} openId={openId} setOpenId={setOpenId} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Fitting Questions</h2>
      <div className="space-y-5">
        {field("lensType",    "Lens Type Desired",      ["Single Vision", "Bifocals", "Progressive"])}
        {field("helmetSize",  "Helmet Size",             ["X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large", "XXX-Large"])}
        {field("hatSize",     "Hat Size",                HAT_OPTS)}
        {field("noseBridge",  "Describe Your Nose Bridge",   ["Small & Petite", "Thin & Narrow", "High & Tall", "Wide & Large", "Low & Flat", "Normal"])}
        {field("sunglassFit", "When Buying Sunglasses", ["All Styles & Sizes Fit", "Need Larger & Wider Frames", "Need Smaller Frames", "Lenses Touch Eyelashes", "Need Floating Nose Pieces", "Never Bought Sunglasses"])}
        {field("frameType",   "Frame Type Preferred", ["With Foam Cushion", "Without Foam Cushion", "Removable Foam Cushion", "Goggles With Strap", "Cover Overs"])}
      </div>
    </div>
  );
}

// ── Step 3: Additional info ───────────────────────────────────────────────────

function Step3({ vals, update, rxUploading, photoUploading, onRxFile, onPhotoFile }: { vals: FormVals; update: UpdateFn; rxUploading: boolean; photoUploading: boolean; onRxFile: (f: File | null) => void; onPhotoFile: (f: File | null) => void }) {
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
          <FileUpload id="rxFile" url={vals.rxUrl} uploading={rxUploading} label="Prescription Uploaded" onChange={onRxFile} />
        </div>
        <div>
          <label className="text-[13px] text-grey-500 mb-1.5 block">Upload Headshot (Optional)</label>
          <FileUpload id="photoFile" url={vals.photoUrl} uploading={photoUploading} label="Headshot Uploaded" onChange={onPhotoFile} />
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

// ── Step 4: Review ────────────────────────────────────────────────────────────

function Step4({ vals, pkg }: { vals: FormVals; pkg: TBYBPackage }) {
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

  const pairsLabel = pkg.pairsMin === pkg.pairsMax ? `${pkg.pairsMin} Pairs` : `${pkg.pairsMin}–${pkg.pairsMax} Pairs`;

  return (
    <div>
      <h2 className="text-[21px] font-normal mb-6">Confirm Your Details</h2>
      <div className="space-y-6">
        {section("Package",
          <>{row("Selected", `${pkg.name} — $${(pkg.priceCents / 100).toFixed(0)} Deposit`)}{row("Pairs", pairsLabel)}</>
        )}
        {section("Prescription — OD (Right Eye)",
          <>{row("Sphere", vals.odSphere)}{row("Cylinder", vals.odCylinder)}{row("Axis", vals.odAxis)}</>
        )}
        {section("Prescription — OS (Left Eye)",
          <>{row("Sphere", vals.osSphere)}{row("Cylinder", vals.osCylinder)}{row("Axis", vals.osAxis)}</>
        )}
        {section("Fitting Questions",
          <>{row("Lens Type", vals.lensType)}{row("Helmet Size", vals.helmetSize)}{row("Hat Size", vals.hatSize)}{row("Nose Bridge", vals.noseBridge)}{row("Sunglass Fit", vals.sunglassFit)}{row("Frame Type", vals.frameType)}</>
        )}
        {section("Additional Info",
          <>{row("Comments", vals.comments)}{rowLink("Prescription", vals.rxUrl, "Prescription Uploaded")}{rowLink("Headshot", vals.photoUrl, "Headshot Uploaded")}</>
        )}
        {section("Contact Info",
          <>{row("Name", vals.name)}{row("Email", vals.email)}{row("Phone", vals.phone)}</>
        )}
      </div>
      <p className="text-[13px] text-grey-500 leading-relaxed mt-8">Double-check everything above. You can go back to fix anything first.</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const INIT: FormVals = {
  odSphere: null, odCylinder: null, odAxis: null,
  osSphere: null, osCylinder: null, osAxis: null,
  lensType: null, helmetSize: null, hatSize: null,
  noseBridge: null, sunglassFit: null, frameType: null,
  comments: "", name: "", email: "", phone: "",
  rxUrl: null, photoUrl: null,
};

export default function TBYBClient({ packages, email, name }: { packages: TBYBPackage[]; email: string; name: string }) {
  const [selectedPkg, setSelectedPkg] = useState<TBYBPackage | null>(null);
  const [step, setStep] = useState<number>(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [vals, setVals] = useState<FormVals>({ ...INIT, email, name });
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${brandSlug}:tbyb`);
      if (!stored) return;

      const { packageId, step: savedStep, vals: savedVals } = JSON.parse(stored);

      const pkg = packages.find(p => p.id === packageId);
      if (pkg) setSelectedPkg(pkg);

      if (savedStep) setStep(savedStep);

      if (savedVals) setVals(prev => ({ ...prev, ...savedVals }));
    } catch {}
  }, []);

  function saveToLS(toStep: number, pkgId: string | null) {
    try {
      const { name: _name, email: _email, ...serializableVals } = vals;

      localStorage.setItem(`${brandSlug}:tbyb`, JSON.stringify({
        packageId: pkgId,
        step: toStep,
        vals: serializableVals,
      }));
    } catch {}
  }
  const [rxUploading, setRxUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  function update(key: keyof FormVals, value: string | null) {
    setVals(prev => {
      const next = { ...prev, [key]: value };
      if (key === "odCylinder" && value === "None") next.odAxis = null;
      if (key === "osCylinder" && value === "None") next.osAxis = null;
      return next;
    });
  }

  async function handleRxFile(f: File | null) {
    if (!f) { update("rxUrl", null); return; }
    setRxUploading(true);
    try {
      const fd = new FormData(); fd.append("file", f);
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
      const fd = new FormData(); fd.append("file", f);
      const r = await uploadFile(fd);
      update("photoUrl", r.url);
    } catch {
      setError("Headshot upload failed!");
    } finally {
      setPhotoUploading(false);
    }
  }

  useEffect(() => {
    if (selectedPkg && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedPkg]);

  function selectPkg(pkg: TBYBPackage) {
    if (!email || !name) { router.push("/sign-in"); return; }
    if (selectedPkg?.id === pkg.id) { setSelectedPkg(null); saveToLS(step, null); return; }
    setSelectedPkg(pkg);
    saveToLS(step, pkg.id);
    setError(null);
  }

  async function handleNext() {
    setError(null);

    if (step === 1) {
      if (!vals.odSphere)   { setError("Please select your right eye (OD) sphere!"); return; }
      if (!vals.odCylinder) { setError("Please select your right eye (OD) cylinder!"); return; }
      if (vals.odCylinder !== "None" && !vals.odAxis) { setError("Please select your right eye (OD) axis!"); return; }
      if (!vals.osSphere)   { setError("Please select your left eye (OS) sphere!"); return; }
      if (!vals.osCylinder) { setError("Please select your left eye (OS) cylinder!"); return; }
      if (vals.osCylinder !== "None" && !vals.osAxis) { setError("Please select your left eye (OS) axis!"); return; }
      saveToLS(step + 1, selectedPkg!.id);
      setStep(s => s + 1);
      return;
    }

    if (step === 2) {
      if (!vals.lensType)    { setError("Please select a lens type!"); return; }
      if (!vals.helmetSize)  { setError("Please select your helmet size!"); return; }
      if (!vals.hatSize)     { setError("Please select your hat size!"); return; }
      if (!vals.noseBridge)  { setError("Please describe your nose bridge!"); return; }
      if (!vals.sunglassFit) { setError("Please select your sunglass fit!"); return; }
      if (!vals.frameType)   { setError("Please select a frame type!"); return; }
      saveToLS(step + 1, selectedPkg!.id);
      setStep(s => s + 1);
      return;
    }

    if (step === 3) {
      if (!vals.name.trim()) { setError("Name is required!"); return; }
      if (!vals.email.trim()) { setError("Email is required!"); return; }
      saveToLS(step + 1, selectedPkg!.id);
      setStep(s => s + 1);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitTBYB({
        packageId: selectedPkg!.id,
        odSphere: vals.odSphere, odCylinder: vals.odCylinder, odAxis: vals.odAxis || "None",
        osSphere: vals.osSphere, osCylinder: vals.osCylinder, osAxis: vals.osAxis || "None",
        lensType: vals.lensType, helmetSize: vals.helmetSize, hatSize: vals.hatSize,
        noseBridge: vals.noseBridge, sunglassFit: vals.sunglassFit, frameType: vals.frameType,
        comments: vals.comments || "None", name: vals.name, email: vals.email, phone: vals.phone || "None",
        prescriptionUrl: vals.rxUrl || "None",
        headshotUrl: vals.photoUrl || "None",
      }, `${window.location.origin}/rx/success`, `${window.location.origin}/rx`);
      router.push(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Package grid */}
      <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-9 lg:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {packages.map(pkg => {
            const isSelected = selectedPkg?.id === pkg.id;
            const pairsLabel = pkg.pairsMin === pkg.pairsMax ? `${pkg.pairsMin} Pairs` : `${pkg.pairsMin}–${pkg.pairsMax} Pairs`;
            return (
              <div key={pkg.id} className={`group/pkg relative border p-6 flex flex-col transition-colors duration-200 ${isSelected ? "border-ink" : "border-grey-200 hover:border-grey-300"}`}>
                <div className="h-16 flex items-center">
                  <img src={pkg.imageSrc} alt={pkg.brands.join(", ")} className="max-h-16 max-w-[70%] object-contain" />
                </div>
                <p className="text-[18px] mt-4">{pkg.name}</p>
                <p className="text-[13px] text-grey-500 mt-1">{pairsLabel}</p>
                <p className="text-[13px] text-grey-400 mt-1 overflow-hidden transition-all duration-200 max-h-8 opacity-100 lg:max-h-0 lg:opacity-0 lg:group-hover/pkg:max-h-8 lg:group-hover/pkg:opacity-100">
                  Includes: {pkg.brands.join(", ")}
                </p>
                <p className="text-[26px] mt-5">${(pkg.priceCents / 100).toFixed(0)}<span className="text-[13px] text-grey-500"> Deposit</span></p>
                <button type="button" onClick={() => selectPkg(pkg)}
                  disabled={submitting || rxUploading || photoUploading}
                  className={`mt-6 border text-[15px] py-3 transition-colors duration-200 disabled:opacity-50 ${isSelected ? "border-ink bg-ink text-paper" : "border-ink hover:bg-ink hover:text-paper"}`}>
                  {isSelected ? "Selected" : "Select Package"}
                </button>
              </div>
            );
          })}
        </div>
        <div ref={formRef} />
      </section>

      {/* Form region */}
      {selectedPkg && (
        <section className="mx-auto max-w-[1680px] px-5 lg:px-10 mt-16">
          <div className="max-w-[640px] mx-auto border-t border-grey-200 pt-12">
            <StepDots step={step} />
            <p className="text-[13px] text-grey-500 text-center mb-8">
              Selected: <span className="text-ink">{selectedPkg.name} — ${(selectedPkg.priceCents / 100).toFixed(0)} Deposit</span>
            </p>
            {step === 1 && <Step1 vals={vals} update={update} openId={openId} setOpenId={setOpenId} />}
            {step === 2 && <Step2 vals={vals} update={update} openId={openId} setOpenId={setOpenId} />}
            {step === 3 && <Step3 vals={vals} update={update} rxUploading={rxUploading} photoUploading={photoUploading} onRxFile={handleRxFile} onPhotoFile={handlePhotoFile} />}
            {step === 4 && <Step4 vals={vals} pkg={selectedPkg} />}
            {error && (
              <div className="flex items-start gap-2.5 border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3 mt-6">
                <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
                <span>{error}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-6">
              <button type="button" onClick={() => { setStep(s => s - 1); setError(null); }}
                disabled={submitting || rxUploading || photoUploading}
                className={`text-[15px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200 disabled:opacity-30 ${step === 1 ? "invisible" : ""}`}>
                Back
              </button>
              <button type="button" onClick={handleNext} disabled={submitting || rxUploading || photoUploading}
                className="bg-ink text-paper text-[15px] px-9 py-3.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50">
                {submitting ? "Submitting…" : step === 4 ? "Submit" : step === 3 ? "Review" : "Continue"}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
