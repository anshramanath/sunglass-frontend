import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="text-center mb-[20vh]">
        <p className="text-[92px] font-light tracking-[-0.03em] leading-none">404</p>
        <h1 className="text-[26px] lg:text-[34px] font-normal tracking-[-0.01em] mt-4">We can&apos;t find that page</h1>
        <p className="text-[15px] text-grey-600 leading-relaxed mt-3">
          The link may be broken or the page may have moved.
        </p>
        <Link href="/" className="inline-block bg-ink text-paper text-[15px] py-4 px-9 mt-9 hover:bg-grey-800 transition-colors duration-200">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
