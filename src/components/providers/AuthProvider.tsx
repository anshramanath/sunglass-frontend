"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUser } from "@/lib/auth";

type AuthContextValue = { loggedIn: boolean; setLoggedIn: (v: boolean) => void };

const AuthContext = createContext<AuthContextValue>({ loggedIn: false, setLoggedIn: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    getUser().then((user) => { if (user) setLoggedIn(true); }).catch(() => {});
  }, []);

  return <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>{children}</AuthContext.Provider>;
}

export function useLoggedIn() {
  return useContext(AuthContext).loggedIn;
}

export function useSetLoggedIn() {
  return useContext(AuthContext).setLoggedIn;
}
