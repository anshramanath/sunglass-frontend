"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp, requestPasswordReset } from "@/lib/auth";
import { useSetLoggedIn } from "@/components/providers/AuthProvider";

type Mode = "signin" | "signup" | "forgot";

export default function AuthForms({ confirmedEmail }: { confirmedEmail?: string }) {
  const router = useRouter();
  const setLoggedIn = useSetLoggedIn();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(confirmedEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(confirmedEmail ? "Email confirmed — sign in." : null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    if (mode === "forgot") {
      const err = await requestPasswordReset(email);
      if (err) { setError(err); setIsPending(false); return; }
      setNotice("If an account exists with that email, you'll receive a reset link shortly.");
      setIsPending(false);
      return;
    }

    const err = mode === "signin"
      ? await signIn(email, password)
      : await signUp(name, email, password);
    if (err) { setError(err); setIsPending(false); return; }
    if (mode === "signup") {
      setMode("signin");
      setNotice(`Check your email at ${email} to confirm your account, then sign in.`);
      setIsPending(false);
      return;
    }
    setLoggedIn(true);
    router.push("/");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
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
        {mode !== "forgot" && (
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
        )}
        {error && <p className="text-[13px] text-brand">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-ink text-paper text-[15px] py-3.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50"
        >
          {isPending
            ? mode === "forgot" ? "Sending…" : mode === "signin" ? "Signing in…" : "Creating account…"
            : mode === "forgot" ? "Send Reset Link" : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-4">
        {mode === "signin" ? (
          <>
            <button type="button" onClick={() => switchMode("forgot")} className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              Forgot Password?
            </button>
            <button type="button" onClick={() => switchMode("signup")} className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
              Create An Account
            </button>
          </>
        ) : (
          <button type="button" onClick={() => switchMode("signin")} className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
            Back to Sign In
          </button>
        )}
      </div>
      {notice && <p className="text-[13px] text-grey-600 leading-snug mt-4">{notice}</p>}
    </>
  );
}
