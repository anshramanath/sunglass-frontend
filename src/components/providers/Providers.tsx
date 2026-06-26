"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { BookmarkProvider } from "./BookmarkProvider";

export default function Providers({ brandSlug, children }: { brandSlug: string; children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider brandSlug={brandSlug}>
        <BookmarkProvider brandSlug={brandSlug}>
          {children}
        </BookmarkProvider>
      </CartProvider>
    </AuthProvider>
  );
}
