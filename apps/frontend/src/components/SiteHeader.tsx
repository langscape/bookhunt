"use client";

import Link from "next/link";
import { Galada } from "next/font/google";

import { NavigationLinkView } from "@/lib/directus";
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

interface SiteHeaderProps {
  navigation?: NavigationLinkView[];
}

export function SiteHeader({ navigation = [] }: SiteHeaderProps) {
  const { openAuthDialog } = useAuthDialog();
  const isAuthenticated = false;
  const displayName = "";

  async function handleUserClick() {
    await openAuthDialog({
      context: "general",
      allowGuest: false,
      showGuestInput: false,
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className={`text-4xl font-bold text-slate-900 sm:text-5xl ${galada.className}`}
          >
            Bookhunt
          </Link>
          {navigation.length > 0 && (
            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                  className="rounded-full px-3 py-1 font-medium transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-4 text-sm text-slate-600">
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
          </div>
        </div>
      </div>
    </header>
  );
}
