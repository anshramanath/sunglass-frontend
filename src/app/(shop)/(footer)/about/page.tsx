import { getBrand } from "@/lib/brand";

export default function AboutPage() {
  const { name } = getBrand();

  return (
    <main className="flex-1 px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[620px]">
        <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium text-center">Our Story</p>
        <h1 className="text-[34px] lg:text-[56px] font-normal tracking-[-0.01em] text-center mt-3 leading-tight">Great sunglasses at a great price.</h1>

        <div className="mt-12 space-y-6 text-[18px] text-grey-700 leading-relaxed">
          <p>{name} exists because good eyewear doesn&apos;t have to be expensive. We find frames that look great, hold up well, and won&apos;t make you think twice about the price tag.</p>
          <p>Every pair on this site is here because we&apos;d wear it ourselves. Good lenses, solid build, styles that actually turn heads — without the markup that comes with a logo on the side.</p>
          <p className="text-brand">Cool sunglasses. Fair prices. That&apos;s the whole thing.</p>
        </div>
      </div>
    </main>
  );
}
