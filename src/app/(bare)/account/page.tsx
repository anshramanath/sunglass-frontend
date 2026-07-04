import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { getOrders } from "@/lib/api";
import { getBrand } from "@/lib/brand";
import { formatPrice } from "@/lib/utils";
import SignOutButton from "./SignOutButton";

const STATUS: Record<string, { label: string; colored: boolean }> = {
  processing:          { label: "Processing",          colored: false },
  shipped:             { label: "Shipped",             colored: true  },
  delivered:           { label: "Delivered",           colored: false },
  partially_refunded:  { label: "Partially Refunded",  colored: true  },
  refunded:            { label: "Refunded",            colored: true  },
};

function StatusBadge({ status }: { status: string }) {
  const { label, colored } = STATUS[status];
  return (
    <span className={`text-[11px] uppercase tracking-wider font-medium px-2.5 py-1 border ${colored ? "text-brand border-brand" : "text-ink border-grey-300"}`}>
      {label}
    </span>
  );
}

export default async function AccountPage() {
  const user = await requireUser();
  const orders = await getOrders();
  const brand = getBrand();
  const email = user.email ?? "";
  const displayName = user.user_metadata?.display_name ?? "";
  const latestAddress = orders.find((o) => o.shippingAddress)?.shippingAddress ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-grey-200">
        <div className="mx-auto max-w-[1100px] px-5 lg:px-10">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/" className="shrink-0" aria-label={`${brand.name} home`}>
              <Image src={brand.logo} alt={brand.name} width={120} height={28} className="h-8" style={{ width: "auto" }} />
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

      <main className="mx-auto w-full max-w-[1100px] px-5 lg:px-10 py-10 lg:py-14">

        <div className="border-b border-grey-200 pb-7">
          <div className="flex items-center justify-between">
            <p className="text-[13px] uppercase tracking-wider text-grey-400 font-medium">My Account</p>
            <SignOutButton />
          </div>
          <h1 className="text-[34px] lg:text-[44px] font-normal tracking-[-0.01em] mt-2">Hi{displayName ? `, ${displayName}` : ""}</h1>
        </div>

        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[21px] font-normal">Account Details</h2>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-x-10">
            <dl className="space-y-6">
              <div>
                <dt className="text-[13px] text-grey-500">Email</dt>
                <dd className="text-[15px] mt-1">{email}</dd>
              </div>
              {displayName && (
                <div>
                  <dt className="text-[13px] text-grey-500">Name</dt>
                  <dd className="text-[15px] mt-1">{displayName}</dd>
                </div>
              )}
              <div>
                <dt className="text-[13px] text-grey-500">Member Since</dt>
                <dd className="text-[15px] mt-1">{new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</dd>
              </div>
            </dl>
            {latestAddress && (
              <dl className="mt-6 sm:mt-0">
                <dt className="text-[13px] text-grey-500">Shipping Address</dt>
                <dd className="text-[15px] mt-1 leading-relaxed">
                  {latestAddress.line1}{latestAddress.line2 ? `, ${latestAddress.line2}` : ""}<br />
                  {latestAddress.city}, {latestAddress.state} {latestAddress.postalCode}<br />
                  {latestAddress.country}
                </dd>
              </dl>
            )}
          </div>
        </section>

        <section className="mt-10 border-t border-grey-200 pt-10">
          <h2 className="text-[21px] font-normal">Order History</h2>
          {orders.length === 0 ? (
            <p className="text-[15px] text-grey-500 mt-6">No orders yet.</p>
          ) : (
            <div className="mt-6 space-y-5">
              {orders.map((order) => (
                <div key={order.id} className="border border-grey-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-grey-200">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
                      <span><span className="text-grey-500">Order</span> <span className="text-ink">#{order.id.slice(-8).toUpperCase()}</span></span>
                      <span className="text-grey-500">Placed {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="px-5 sm:px-6 py-5">
                    <div className="space-y-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="block w-16 shrink-0 bg-grey-100 aspect-[4/5] overflow-hidden flex items-center justify-center p-1.5">
                            <Image src={item.imageSrc} alt={item.name} width={64} height={80} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px]">{item.name}</p>
                            <p className="text-[13px] text-grey-500 mt-0.5">
                              {item.attribute ? `${item.attribute} · ` : ""}Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-[15px] shrink-0">{formatPrice(item.priceCents * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 py-4 border-t border-grey-200">
                    <p className="text-[15px]"><span className="text-grey-500">Total</span> {formatPrice(order.totalCents)}</p>
                    {order.refundedCents && (
                      <p className="text-[15px] mt-0.5" style={{ color: "var(--color-brand)" }}><span className="text-grey-500">Refunded</span> {formatPrice(order.refundedCents)}</p>
                    )}
                    {order.shippingAddress && (
                      <p className="text-[13px] text-grey-500 mt-1">
                        {order.shippingAddress.name} · {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
