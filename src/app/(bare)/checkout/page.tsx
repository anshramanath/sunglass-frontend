import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { BRAND } from "@/lib/brand";

export default function CheckoutPage() {
  return <CheckoutPageClient brandLogo={BRAND.logo} brandName={BRAND.name} />;
}
