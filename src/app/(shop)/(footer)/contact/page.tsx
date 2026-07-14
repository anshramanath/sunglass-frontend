export default function ContactPage() {
  return (
    <main className="flex-1 grid place-items-center px-5 py-16">
      <div className="w-full max-w-[440px]">
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em]">Contact</h1>

        <div className="mt-9 space-y-7">
          <div>
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">Email</p>
            <a href="mailto:help@sunglassmonster.com" className="text-[16px] mt-1.5 block underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              help@sunglassmonster.com
            </a>
          </div>

          <div>
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">Phone</p>
            <a href="tel:8772453721" className="text-[16px] mt-1.5 block underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              877-245-3721
            </a>
          </div>

          <div className="border-t border-grey-200 pt-7">
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">Hours</p>
            <p className="text-[16px] mt-1.5">Mon – Fri · 9am – 4pm (CST)</p>
          </div>

          <div className="border-t border-grey-200 pt-7">
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">Response Time</p>
            <p className="text-[16px] mt-1.5">We typically respond to emails within 1–2 business days, and calls immediately during our hours.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
