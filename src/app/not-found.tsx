import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-grey-200">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-10">
          <div className="h-16 flex items-center justify-center">
            <Link href="/" aria-label={`${BRAND.name} home`}>
              <Image src={BRAND.logo} alt={BRAND.name} width={120} height={28} className="h-8 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-5 py-20">
        <div className="w-full max-w-[520px] text-center">

          <p className="text-[92px] font-light tracking-[-0.03em] leading-none">404</p>
          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mt-6">Page Not Found</p>
          <h1 className="text-[26px] lg:text-[34px] font-normal tracking-[-0.01em] mt-3">We can&apos;t find that page</h1>
          <p className="text-[16px] text-grey-600 leading-relaxed mt-4">
            The link may be broken or the page may have moved. Let&apos;s get you back to something good.
          </p>

          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mt-11 mb-5">Popular Right Now</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/category/sunglasses" className="border border-grey-300 hover:border-ink transition-colors duration-200 h-10 px-4 grid place-items-center text-[13px]">Sunglasses</Link>
            <Link href="/category/readers" className="border border-grey-300 hover:border-ink transition-colors duration-200 h-10 px-4 grid place-items-center text-[13px]">Readers</Link>
            <Link href="/category/bifocals" className="border border-grey-300 hover:border-ink transition-colors duration-200 h-10 px-4 grid place-items-center text-[13px]">Bifocals</Link>
            <Link href="/sale" className="border border-grey-300 hover:border-ink transition-colors duration-200 h-10 px-4 grid place-items-center text-[13px] text-sale">Sale</Link>
          </div>

          <Link href="/" className="inline-block bg-ink text-paper text-[15px] py-4 px-9 mt-11 hover:bg-grey-800 transition-colors duration-200">
            Back to Home
          </Link>

          <p className="text-[13px] text-grey-500 leading-relaxed mt-9">
            Still stuck?{" "}
            <a href="#" className="underline underline-offset-4 hover:text-ink transition-colors duration-200">Contact support</a>
          </p>

        </div>
      </main>
    </div>
  );
}
