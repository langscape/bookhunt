"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Galada } from "next/font/google";

import { useAuthDialog } from "@/components/auth/AuthDialogProvider";

const galada = Galada({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

function UserAvatar({ name }: { name?: string | null }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
      {initial}
    </span>
  );
}

function PersonIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-6 w-6 text-slate-500"
      fill="currentColor"
    >
      <path d="M12 12c2.761 0 5-2.462 5-5.5S14.761 1 12 1 7 3.462 7 6.5 9.239 12 12 12m0 2c-3.627 0-11 1.838-11 5.5V23h22v-3.5C23 15.838 15.627 14 12 14" />
    </svg>
  );
}

export function SiteHeader() {
  const { data: session, status } = useSession();
  const { openAuthDialog } = useAuthDialog();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const displayName = session?.user?.name ?? session?.user?.email ?? "";

  async function handleUserClick() {
    if (isAuthenticated) {
      if (pathname !== "/profile") {
        router.push("/profile");
      }
      return;
    }
    await openAuthDialog({
      context: "general",
      allowGuest: false,
      showGuestInput: false,
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 ">
        <Link
          href="/"
          className={`text-5xl font-bold text-slate-900 ${galada.className}`}
        >
          Bookhunt
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link
            href="/books/new"
            className="hidden rounded-full border border-violet-200 px-4 py-2 font-medium text-violet-700 transition hover:bg-violet-50 sm:inline-flex"
          >
            Add book
          </Link>
          <button
            type="button"
            onClick={handleUserClick}
            className="group flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left shadow-sm transition hover:border-violet-300 hover:shadow"
            aria-label={isAuthenticated ? "Open profile" : "Sign in"}
          >
            {isAuthenticated ? (
              <UserAvatar name={displayName} />
            ) : (
              <PersonIcon />
            )}
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {isAuthenticated ? displayName || "Profile" : "Sign in"}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
