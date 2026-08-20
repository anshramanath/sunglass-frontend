"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/auth";
import { useSetLoggedIn } from "@/components/providers/AuthProvider";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const setLoggedIn = useSetLoggedIn();

  async function handleDelete() {
    setDeleting(true);
    setLoggedIn(false);
    await deleteAccount();
    setLoggedIn(true);
    setDeleting(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 text-[13px] underline underline-offset-4 hover:opacity-70 transition-opacity duration-200"
        style={{ color: "var(--color-brand)" }}
      >
        Delete Account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div onClick={() => !deleting && setOpen(false)} className="absolute inset-0 bg-ink/40" />
          <div className="relative bg-paper w-full max-w-sm p-7">
            <h3 className="text-[21px] font-normal">Delete your account?</h3>
            <p className="text-[13px] text-grey-500 mt-3 leading-relaxed">This permanently deletes your account and sign-in credentials. Past orders are retained for our records but no longer linked to your account. This can&apos;t be undone.</p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="flex-1 text-[13px] border border-grey-300 py-3 hover:bg-grey-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 text-[13px] text-paper bg-brand py-3 hover:opacity-80 transition-opacity duration-200 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
