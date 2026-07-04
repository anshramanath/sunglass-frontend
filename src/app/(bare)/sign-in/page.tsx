import Link from "next/link";
import Image from "next/image";
import { getBrand } from "@/lib/brand";
import AuthForms from "./AuthForms";

const BENEFITS = [
  {
    label: "Private\nSales",
    path: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
    extra: <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />,
  },
  {
    label: "Free\nShipping",
    path: "M1 4h14v11H1zM15 8h4l4 4v3h-8zM6 18.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM16.5 18.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0z",
  },
  {
    label: "Faster\nCheckout",
    path: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18m-9 7 2 2 4-4",
  },
  {
    label: "Saved\nLists",
    path: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  },
];

export default function SignInPage() {
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

        {/* Top bar */}
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
          <a href="#" className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
            Need Help?
          </a>
        </div>

        {/* Centered content */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[380px] mx-auto py-10">

          <p className="text-[15px] text-grey-700">
            Sign in or create an account to enjoy the benefits
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-4 gap-2 mt-6 mb-7">
            {BENEFITS.map(({ label, path, extra }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d={path} />
                  {extra}
                </svg>
                <span className="text-[11px] text-grey-600 leading-tight whitespace-pre-line">{label}</span>
              </div>
            ))}
          </div>

          <AuthForms />
        </div>
      </div>
    </div>
  );
}
