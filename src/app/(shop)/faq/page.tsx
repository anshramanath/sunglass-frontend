import Link from "next/link";
import FaqItem from "./FaqItem";

export default function FaqPage() {
  return (
    <main className="flex-1 px-5 py-14 lg:py-16">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] text-center">FAQ</h1>

        {/* Orders */}
        <div className="mt-12">
          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mb-2">Orders</p>
          <div className="border-t border-grey-200">
            <FaqItem question="Where can I see my orders?">
              <p className="text-[15px] text-grey-600 leading-relaxed">Sign in and go to your account page — all past orders are listed there with status and items.</p>
            </FaqItem>
            <FaqItem question="What do order statuses mean?">
              <dl className="text-[15px] space-y-3">
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-ink">Processing</dt>
                  <dd className="text-grey-600 leading-relaxed">We&apos;ve received your order and it&apos;s being prepared.</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-ink">Shipped</dt>
                  <dd className="text-grey-600 leading-relaxed">It&apos;s on its way.</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-ink">Delivered</dt>
                  <dd className="text-grey-600 leading-relaxed">It&apos;s arrived.</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-ink">Refunded</dt>
                  <dd className="text-grey-600 leading-relaxed">Your order has been fully refunded.</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-ink">Partially Refunded</dt>
                  <dd className="text-grey-600 leading-relaxed">A partial refund has been issued on your order.</dd>
                </div>
              </dl>
            </FaqItem>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="mt-10">
          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mb-2">Cart &amp; Checkout</p>
          <div className="border-t border-grey-200">
            <FaqItem question="Do I need an account to check out?">
              <p className="text-[15px] text-grey-600 leading-relaxed">Yes — you need an account to place an order. You can browse and add items to your cart without signing in, but you&apos;ll be asked to sign in or create an account before completing your purchase.</p>
            </FaqItem>
            <FaqItem question="What happens if I sign in on another device?">
              <p className="text-[15px] text-grey-600 leading-relaxed">Your cart and saved items sync to your account, so they&apos;ll be there when you sign in anywhere.</p>
            </FaqItem>
            <FaqItem question="What if a price changes before I check out?">
              <p className="text-[15px] text-grey-600 leading-relaxed">Prices and availability are confirmed during checkout. If an item&apos;s price has changed, you&apos;ll see the updated price before completing your purchase.</p>
            </FaqItem>
            <FaqItem question="Who handles payment?">
              <p className="text-[15px] text-grey-600 leading-relaxed">Stripe. We never see or store your card details.</p>
            </FaqItem>
          </div>
        </div>

        {/* Account */}
        <div className="mt-10">
          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mb-2">Account</p>
          <div className="border-t border-grey-200">
            <FaqItem question="Can I delete my account?">
              <p className="text-[15px] text-grey-600 leading-relaxed">Yes — you can delete your account from your account page. Your account is permanently deleted. Your past orders are retained for our business records, but they are no longer linked to your account.</p>
            </FaqItem>
          </div>
        </div>

        {/* Returns & Refunds */}
        <div className="mt-10">
          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mb-2">Returns &amp; Refunds</p>
          <div className="border-t border-grey-200">
            <FaqItem question="How do I request a refund?">
              <p className="text-[15px] text-grey-600 leading-relaxed">
                Email us at <a href="mailto:support@[brand].com" className="underline underline-offset-4 hover:text-ink transition-colors duration-200">support@[brand].com</a>{" "}with your order number. We&apos;ll walk you through the process.
              </p>
            </FaqItem>
            <FaqItem question="How long does a refund take?">
              <p className="text-[15px] text-grey-600 leading-relaxed">Once we receive and inspect the return, allow 5–7 business days for the refund to appear on your original payment method.</p>
            </FaqItem>
            <FaqItem question="Can I return a sale item?">
              <p className="text-[15px] text-grey-600 leading-relaxed">No — sale items are final sale.</p>
            </FaqItem>
          </div>
        </div>

        {/* Shipping */}
        <div className="mt-10 mb-4">
          <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium mb-2">Shipping</p>
          <div className="border-t border-b border-grey-200 py-5">
            <p className="text-[15px] text-grey-600 leading-relaxed">
              See our <Link href="/shipping" className="text-ink underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">Shipping Policy</Link> page for details.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
