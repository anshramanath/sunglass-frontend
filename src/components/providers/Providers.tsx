"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { BookmarkProvider } from "@/components/providers/BookmarkProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <BookmarkProvider>
          {children}
        </BookmarkProvider>
      </CartProvider>
    </AuthProvider>
  );
}
