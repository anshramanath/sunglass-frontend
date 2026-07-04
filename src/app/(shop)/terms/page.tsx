import { getBrand } from "@/lib/brand";

export default function TermsPage() {
  const { name } = getBrand();

  return (
    <main className="flex-1 px-5 py-14 lg:py-16">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] text-center">Terms of Use</h1>

        <ol className="mt-12 space-y-5 text-[15px] text-grey-600 leading-relaxed list-decimal list-outside pl-5 marker:text-ink">
          <li>You must be 18 or older to use this site.</li>
          <li>You&apos;re responsible for keeping your account credentials secure.</li>
          <li>We reserve the right to cancel or refuse any order.</li>
          <li>Prices are subject to change.</li>
          <li>Payments are processed by Stripe — we do not store card details.</li>
          <li>Product descriptions and images are provided for informational purposes. While we strive for accuracy, minor variations may occur.</li>
          <li>All site content is the property of {name}.</li>
          <li>We are not liable for indirect or consequential damages arising from your use of the site.</li>
          <li>We are not responsible for delays or failures caused by events beyond our reasonable control, including carrier delays, natural disasters, labor disputes, or interruptions in internet or payment services.</li>
          <li>These terms are governed by the laws of the State of Texas, United States.</li>
        </ol>
      </div>
    </main>
  );
}
