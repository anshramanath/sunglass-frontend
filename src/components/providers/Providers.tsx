"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { BookmarkProvider } from "./BookmarkProvider";

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
