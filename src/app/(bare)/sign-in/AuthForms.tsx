"use client";

import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

export default function AuthForms() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return mode === "signin"
    ? <SignInForm onSwitch={() => setMode("signup")} />
    : <SignUpForm onSwitch={() => setMode("signin")} />;
}
