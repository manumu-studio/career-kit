"use client";

/** Top bar showing authenticated user identity, nav links, and sign-out action. */
import Link from "next/link";
import type { UserBarProps } from "./UserBar.types";

export function UserBar({ userName, userEmail }: UserBarProps) {
  const displayName = userName ?? userEmail ?? "User";

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">
          Signed in as <span className="font-medium text-slate-100">{displayName}</span>
        </span>
        <Link
          className="text-sm text-slate-400 transition hover:text-slate-200"
          href="/history"
        >
          History
        </Link>
      </div>
      <button
        onClick={() => {
          window.location.href = "/api/auth/federated-signout?local_only=1";
        }}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
        type="button"
      >
        Sign Out
      </button>
    </header>
  );
}
