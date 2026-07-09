
export default function PrivacyPage() {
  return (
    <main className="flex-1 px-5 py-14 lg:py-16">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] text-center">Privacy Policy</h1>

        <div className="mt-12 space-y-9">

          <section>
            <h2 className="text-[21px] font-normal">What we collect</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">When you create an account: your name and email. When you place an order: your shipping address, purchased products, order history, and order status, collected by Stripe at checkout. When you&apos;re signed in: your cart and saved items are synced to our database.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">How we use it</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">To fulfill and track your orders. To sync your cart and saved items across devices when you&apos;re signed in. To authenticate your account. To process refund requests submitted via email.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Third parties</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">Stripe securely processes payments on our behalf. Payment card information is collected directly by Stripe and is never stored on our servers. Supabase powers our authentication and database.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Cookies &amp; local storage</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">We use one session cookie to keep you signed in (managed by Supabase) and localStorage to save your cart and bookmarks if you&apos;re not signed in.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Your data</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">You can delete your account at any time from your account page. Deleting your account removes your sign-in credentials and permanently disconnects your account from your past orders. We retain order records, including shipping information, where necessary for legal, accounting, fraud prevention, customer support, dispute resolution, and other legitimate business purposes. To request additional information about your data, contact us at <a href="mailto:support@[brand].com" className="text-ink underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">support@[brand].com</a>.</p>
          </section>

          <section className="border-t border-grey-200 pt-9">
            <h2 className="text-[21px] font-normal">Updates</h2>
            <p className="text-[15px] text-grey-600 leading-relaxed mt-3">We may update this policy. The latest version is always at this page.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
