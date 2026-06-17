"use client";

import { useState } from "react";
import { signUp } from "@/lib/supabase/auth";

export default function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
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
    const err = await signUp(name, email, password);
    if (err) { setError(err); setIsPending(false); }
  }

  return (
    <>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          autoComplete="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-4 h-12 text-[15px] outline-none placeholder-grey-400"
        />
        <input
          type="email"
          autoComplete="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-4 h-12 text-[15px] outline-none placeholder-grey-400"
        />
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-4 pr-16 h-12 text-[15px] outline-none placeholder-grey-400"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-grey-500 hover:text-ink transition-colors duration-200"
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-[13px] text-sale">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-ink text-paper text-[15px] py-3.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50"
        >
          {isPending ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-4">
        <a href="#" className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
          Need Help?
        </a>
        <button type="button" onClick={onSwitch} className="whitespace-nowrap text-[13px] underline underline-offset-4 hover:opacity-60 transition-opacity duration-200">
          Sign In
        </button>
      </div>
    </>
  );
}
