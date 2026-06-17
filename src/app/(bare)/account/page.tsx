import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import SignOutButton from "./SignOutButton";

export default async function AccountPage() {
  const user = await requireUser();
  const email = user.email ?? "";
  const displayName = user.user_metadata?.display_name ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-grey-200">
        <div className="mx-auto max-w-[920px] px-5 lg:px-10">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/" className="shrink-0" aria-label={`${BRAND.name} home`}>
              <Image src={BRAND.logo} alt={BRAND.name} width={120} height={28} className="h-8 w-auto" />
            </Link>
            <Link href="/" className="flex items-center gap-1.5 whitespace-nowrap text-[13px] hover:opacity-60 transition-opacity duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[920px] px-5 lg:px-10 py-10 lg:py-14">

        <div className="border-b border-grey-200 pb-7">
          <div className="flex items-center justify-between">
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">My Account</p>
            <SignOutButton />
          </div>
          <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-2">Hi{displayName ? `, ${displayName}` : ""}</h1>
        </div>

        <section className="mt-10">
          <h2 className="text-[21px] font-normal">Account Details</h2>
          <dl className="mt-6 space-y-4">
            {displayName && (
              <div>
                <dt className="text-[13px] text-grey-500">Name</dt>
                <dd className="text-[15px] mt-1">{displayName}</dd>
              </div>
            )}
            <div>
              <dt className="text-[13px] text-grey-500">Email</dt>
              <dd className="text-[15px] mt-1">{email}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-grey-500">Member Since</dt>
              <dd className="text-[15px] mt-1">{new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-10 border-t border-grey-200 pt-10">
          <h2 className="text-[21px] font-normal">Order History</h2>
          <p className="text-[15px] text-grey-500 mt-6">No orders yet.</p>
        </section>

      </main>
    </div>
  );
}
