"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { useSetLoggedIn } from "@/components/providers/AuthProvider";

export default function SignOutButton() {
  const router = useRouter();
  const setLoggedIn = useSetLoggedIn();

  async function handleSignOut() {
    setLoggedIn(false);
    router.push("/");
    await signOut();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="whitespace-nowrap text-[13px] underline underline-offset-4 text-sale hover:opacity-70 transition-opacity duration-200"
    >
      Sign Out
    </button>
  );
}
