export default function ContactPage() {
  return (
    <main className="flex-1 grid place-items-center px-5 py-16">
      <div className="w-full max-w-[440px]">
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em]">Contact</h1>

        <div className="mt-9 space-y-7">
          <div>
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">Email</p>
            <a href="mailto:support@[brand].com" className="text-[16px] mt-1.5 block hover:opacity-60 transition-opacity duration-200">
              support@[brand].com
            </a>
          </div>

          <div className="border-t border-grey-200 pt-7">
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">Hours</p>
            <p className="text-[16px] mt-1.5 leading-relaxed">
              Monday–Friday, 9am–5pm EST<br />
              Saturday, 10am–3pm EST<br />
              Sunday, Closed
            </p>
          </div>

          <div className="border-t border-grey-200 pt-7">
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">Response Time</p>
            <p className="text-[16px] mt-1.5 leading-relaxed">We typically respond within 1–2 business days.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
