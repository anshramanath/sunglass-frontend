"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetWithCode } from "@/lib/auth";
import { useSetLoggedIn } from "@/components/providers/AuthProvider";

export default function ResetForm({ code }: { code?: string }) {
  const router = useRouter();
  const setLoggedIn = useSetLoggedIn();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code) { setError("Invalid or expired reset link."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(null);
    setIsPending(true);
    const err = await resetWithCode(code, password);
    if (err) { setError(err); setIsPending(false); return; }
    setLoggedIn(true);
    router.push("/");
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="relative">
        <input
          type={showPw ? "text" : "password"}
          autoComplete="new-password"
          placeholder="New Password"
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
      <input
        type={showPw ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border border-grey-300 focus:border-ink transition-colors duration-200 px-4 h-12 text-base outline-none placeholder-grey-400"
      />
      {error && <p className="text-[13px] text-brand">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-paper text-[15px] py-3.5 hover:bg-grey-800 transition-colors duration-200 disabled:opacity-50"
      >
        {isPending ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
