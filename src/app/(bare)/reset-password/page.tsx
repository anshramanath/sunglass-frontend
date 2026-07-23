import Link from "next/link";
import Image from "next/image";
import { getBrand } from "@/lib/brand";
import ResetForm from "./ResetForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;
  const brand = getBrand();

  return (
    <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">

      {/* ── Left — product image ── */}
      <div className="relative hidden lg:flex items-center justify-center bg-grey-50 overflow-hidden p-20">
        <Image
          src={brand.hero}
          alt={`${brand.name} eyewear`}
          width={600}
          height={600}
          className="w-full h-full object-contain mix-blend-multiply"
        />
        <Link href="/" className="absolute top-9 left-10" aria-label={`${brand.name} home`}>
          <Image src={brand.logo} alt={brand.name} width={120} height={36} className="h-9 object-contain" style={{ width: "auto" }} />
        </Link>
      </div>

      {/* ── Right — form ── */}
      <div className="relative flex flex-col min-h-screen px-6 sm:px-10 lg:px-14 py-6">

        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] hover:opacity-60 transition-opacity duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <a href="/contact" className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
            Need Help?
          </a>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full max-w-[380px] mx-auto py-10">
          <h1 className="text-[28px] font-normal tracking-[-0.01em] mb-6">Set a new password</h1>
          {error
            ? <p className="text-[13px] text-brand">This reset link is invalid or has expired. Please request a new one.</p>
            : <ResetForm code={code} />
          }
        </div>
      </div>
    </div>
  );
}
