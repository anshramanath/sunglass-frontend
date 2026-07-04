
export default function ShippingPage() {
  return (
    <main className="flex-1 px-5 py-14 lg:py-16">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] text-center">Shipping Policy</h1>

        <div className="mt-12 space-y-9">

          <section>
            <h2 className="text-[21px] font-normal">Cost &amp; processing</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">Shipping is free on all orders. Orders are processed within 1–3 business days.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Delivery</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">You enter your shipping address during Stripe checkout. Delivery times vary by carrier and destination — standard shipping typically arrives in 5–7 business days. We currently ship within the United States.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Your responsibility</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">Customers are responsible for providing an accurate shipping address. We are not responsible for delays or losses resulting from incorrect or incomplete shipping information provided at checkout.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
