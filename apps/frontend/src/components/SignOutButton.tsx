"use client";

export function SignOutButton() {
  return (
    <button
      type="button"
      disabled
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
      title="Connect auth logic to enable sign out"
    >
      Sign out
    </button>
  );
}
