
export default function ReturnsPage() {
  return (
    <main className="flex-1 px-5 py-14 lg:py-16">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] text-center">Returns &amp; Refunds</h1>

        <div className="mt-12 space-y-9">

          <section>
            <h2 className="text-[21px] font-normal">Requesting a return</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">To request a return or refund, email us at <a href="mailto:support@[brand].com" className="text-ink underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">support@[brand].com</a> with your order number.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Eligibility</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">We accept returns within 30 days of delivery. Items must be unused and in original condition. Sale items are final sale.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Refund timing</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">Once we receive and inspect the return, refunds are issued to your original payment method within 5–7 business days. Shipping charges are non-refundable unless the return is due to our error or required by applicable law.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Damaged or incomplete returns</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">Partial refunds may be issued at our discretion for damaged or incomplete returns.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
