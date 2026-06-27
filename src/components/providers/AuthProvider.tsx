"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUser } from "@/lib/auth";

type AuthContextValue = { loggedIn: boolean; setLoggedIn: (v: boolean) => void };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const user = await getUser();
        if (user) setLoggedIn(true);
      } catch {}
    }
    
    check();
  }, []);

  return <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>{children}</AuthContext.Provider>;
}

function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("Auth hooks must be used within AuthProvider");
  return ctx;
}

export function useLoggedIn() {
  return useAuthContext().loggedIn;
}

export function useSetLoggedIn() {
  return useAuthContext().setLoggedIn;
}
