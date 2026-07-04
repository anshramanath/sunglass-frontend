"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";
import { useSetLoggedIn } from "@/components/providers/AuthProvider";

export default function AuthForms() {
  const router = useRouter();
  const setLoggedIn = useSetLoggedIn();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    const err = mode === "signin"
      ? await signIn(email, password)
      : await signUp(name, email, password);
    if (err) { setError(err); setIsPending(false); return; }
    setLoggedIn(true);
    router.push("/");
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setError(null);
  }

  return (
    <>
      <form className="space-y-3" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <input
            type="text"
            autoComplete="name"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-4 h-12 text-base outline-none placeholder-grey-400"
          />
        )}
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-4 h-12 text-base outline-none placeholder-grey-400"
        />
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            name="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-4 pr-16 h-12 text-base outline-none placeholder-grey-400"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-grey-500 hover:text-ink transition-colors duration-200"
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-[13px] text-brand">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-ink text-paper text-[15px] py-3.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50"
        >
          {isPending
            ? mode === "signin" ? "Signing in…" : "Creating account…"
            : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-4">
        {mode === "signin" ? (
          <>
            <a href="#" className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              Forgot Password?
            </a>
            <button type="button" onClick={() => switchMode("signup")} className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              Create An Account
            </button>
          </>
        ) : (
          <>
            <a href="#" className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              Need Help?
            </a>
            <button type="button" onClick={() => switchMode("signin")} className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              Sign In
            </button>
          </>
        )}
      </div>
    </>
  );
}
