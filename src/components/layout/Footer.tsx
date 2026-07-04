import Link from "next/link";
import Image from "next/image";
import { getBrand } from "@/lib/brand";

export default function Footer() {
  const brand = getBrand();

  return (
    <footer className="bg-grey-50 border-t border-grey-200">
      <div className="mx-auto max-w-[1680px] px-5 lg:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" aria-label={`${brand.name} home`}>
          <Image src={brand.logo} alt={brand.name} width={100} height={24} className="h-6" style={{ width: "auto" }} />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-grey-600">
          <Link href="#" className="hover:text-ink transition-colors duration-200">Contact</Link>
          <Link href="#" className="hover:text-ink transition-colors duration-200">FAQ</Link>
          <Link href="#" className="hover:text-ink transition-colors duration-200">About Us</Link>
          <Link href="#" className="hover:text-ink transition-colors duration-200">Privacy Policy</Link>
          <Link href="#" className="hover:text-ink transition-colors duration-200">Terms of Use</Link>
          <Link href="#" className="hover:text-ink transition-colors duration-200">Shipping Policy</Link>
          <Link href="#" className="hover:text-ink transition-colors duration-200">Returns &amp; Refunds</Link>
        </nav>
        <p className="text-[11px] text-grey-400 whitespace-nowrap">
          &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
