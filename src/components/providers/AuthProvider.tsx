"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AuthContextValue = { loggedIn: boolean; setLoggedIn: (v: boolean) => void };

const AuthContext = createContext<AuthContextValue>({ loggedIn: false, setLoggedIn: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  return <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>{children}</AuthContext.Provider>;
}

export function useLoggedIn() {
  return useContext(AuthContext).loggedIn;
}

export function useSetLoggedIn() {
  return useContext(AuthContext).setLoggedIn;
}
