"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="text-center mb-[20vh]">
        <p className="text-[92px] font-light tracking-[-0.03em] leading-none">500</p>
        <h1 className="text-[26px] lg:text-[34px] font-normal tracking-[-0.01em] mt-4">Something went wrong</h1>
        <p className="text-[15px] text-grey-600 leading-relaxed mt-3">
          This one&apos;s on us. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-block bg-ink text-paper text-[15px] py-4 px-9 mt-9 hover:bg-grey-800 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
