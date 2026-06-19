import Link from "next/link";

export default function OrderFailurePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 grid place-items-center px-5 py-20">
        <div className="w-full max-w-[440px] text-center">

          <div className="mx-auto w-16 h-16 rounded-full bg-[#C8322B] grid place-items-center">
            <svg className="w-8 h-8 text-paper" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>

          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mt-7">Payment Unsuccessful</p>
          <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-3">Your payment didn&apos;t go through</h1>
          <p className="text-[15px] text-grey-600 leading-relaxed mt-4">
            We weren&apos;t able to process your payment, so your order wasn&apos;t placed. No charge has been made — your bag is still saved.
          </p>

          <div className="flex flex-col gap-3 mt-9">
            <Link href="/checkout" className="bg-ink text-paper text-[15px] py-4 block hover:bg-grey-800 transition-colors duration-200">
              Try Again
            </Link>
            <Link href="/" className="border border-ink text-[15px] py-4 block hover:bg-ink hover:text-paper transition-colors duration-200">
              Back to Shopping
            </Link>
          </div>

          <p className="text-[13px] text-grey-500 leading-relaxed mt-8">
            Still having trouble?{" "}
            <a href="#" className="underline underline-offset-4 hover:text-ink transition-colors duration-200">
              Contact support
            </a>
          </p>

        </div>
      </main>
    </div>
  );
}
