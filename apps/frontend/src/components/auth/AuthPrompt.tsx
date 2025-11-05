"use client";

import { useEffect, useMemo, useState } from "react";
import { getProviders, signIn, useSession } from "next-auth/react";

import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";

const providerDetails = {
  google: {
    label: "Google",
    className: "bg-[#4285F4] text-white hover:bg-[#3a76e0]",
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M21.6 12.227c0-.815-.073-1.594-.209-2.338H12v4.42h5.4a4.62 4.62 0 0 1-2 3.03v2.513h3.237c1.892-1.74 2.963-4.302 2.963-7.625" />
        <path d="M12 22c2.7 0 4.967-.9 6.623-2.448L15.386 17.04c-.9.6-2.053.954-3.386.954-2.605 0-4.814-1.76-5.6-4.126H3.035v2.588A9.999 9.999 0 0 0 12 22" />
        <path d="M6.4 13.868a5.996 5.996 0 0 1 0-3.736V7.544H3.035a10 10 0 0 0 0 8.912z" />
        <path d="M12 6.958c1.473 0 2.794.507 3.833 1.5l2.875-2.875C16.967 3.9 14.7 3 12 3a9.999 9.999 0 0 0-8.965 4.544l3.365 2.588C7.186 8.718 9.395 6.958 12 6.958" />
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    className: "bg-[#1877F2] text-white hover:bg-[#145dbe]",
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.992H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.464h-1.26c-1.243 0-1.63.772-1.63 1.562V12h2.773l-.443 2.886h-2.33v6.992C18.343 21.128 22 16.99 22 12" />
      </svg>
    ),
  },
  twitter: {
    label: "X",
    className: "bg-black text-white hover:bg-slate-900",
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M20.98 3H16.7l-4.1 5.72L9.09 3H3.02l6.72 9.78L3.35 21h4.29l4.29-5.99L14.9 21h6.07l-6.93-10z" />
      </svg>
    ),
  },
  apple: {
    label: "Apple",
    className: "bg-black text-white hover:bg-slate-900",
    icon: (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M17.266 12.702c-.028-2.27 1.855-3.352 1.938-3.402-1.058-1.547-2.703-1.76-3.281-1.786-1.395-.141-2.716.814-3.424.814-.708 0-1.802-.793-2.962-.772-1.524.022-2.932.887-3.719 2.255-1.586 2.75-.404 6.81 1.14 9.041.756 1.09 1.656 2.313 2.84 2.27 1.141-.045 1.568-.735 2.949-.735 1.381 0 1.754.735 2.965.714 1.225-.02 1.997-1.11 2.748-2.205.866-1.265 1.224-2.497 1.245-2.561-.027-.011-2.386-.917-2.439-3.333m-2.28-6.116c.625-.759 1.05-1.813.937-2.865-.906.036-1.997.603-2.65 1.361-.586.675-1.096 1.754-.96 2.785.999.077 2.047-.508 2.673-1.28" />
      </svg>
    ),
  },
};

type ProviderId = keyof typeof providerDetails;

export type AuthPromptContext = "book" | "comment" | "general";

type AuthPromptProps = {
  context: AuthPromptContext;
  allowGuest?: boolean;
  showGuestInput?: boolean;
  initialGuestName?: string;
  onGuestComplete?: (guestName: string) => void;
  onDismiss?: () => void;
};

export function AuthPrompt({
  context,
  allowGuest = true,
  showGuestInput = true,
  initialGuestName = "",
  onGuestComplete,
  onDismiss,
}: AuthPromptProps) {
  const { data: session, status } = useSession();
  const [view, setView] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [guestName, setGuestName] = useState(initialGuestName);
  const [availableProviders, setAvailableProviders] = useState<ProviderId[]>([]);

  useEffect(() => {
    setGuestName(initialGuestName);
  }, [initialGuestName]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const providers = await getProviders();
        if (!active) {
          return;
        }
        const enabled = Object.keys(providers ?? {}).filter(
          (provider): provider is ProviderId => provider in providerDetails
        );
        setAvailableProviders(enabled);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to fetch auth providers", err);
        }
        setAvailableProviders([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const contextCopy = useMemo(() => {
    if (context === "book") {
      return {
        title: "Create an account to track your book drops",
        description:
          "Sign in to keep a private log of the books you release, see their activity history, and receive updates.",
        skipCta: "Continue as guest",
        guestLabel: "Name to display with this book",
      };
    }
    if (context === "comment") {
      return {
        title: "Sign in to leave richer comments",
        description:
          "With an account you can revisit your past sightings, manage notifications, and help the community spot issues.",
        skipCta: "Skip sign in—I'll comment with my name",
        guestLabel: "Name to show with your comment",
      };
    }
    return {
      title: "Welcome back to Bookhunt",
      description:
        "Sign in to access your profile, track releases, and keep all of your book hunts in sync.",
      skipCta: "Continue without an account",
      guestLabel: "Display name",
    };
  }, [context]);

  async function handleCredentialsSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          displayName: displayName || undefined,
        }),
      });
      const payload = await response.json();
      setLoading(false);
      if (!response.ok) {
        setError(payload?.error ?? "Unable to register");
        return;
      }
      setSuccessMessage("Account created! Signing you in…");
      await signIn("credentials", { email, password, redirect: false });
    } catch (err) {
      setLoading(false);
      setError("Unexpected error");
    }
  }

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please add your name to continue as a guest");
      return;
    }
    setError(null);
    onGuestComplete?.(guestName.trim());
  }

  if (isAuthenticated) {
    const name = session?.user?.name ?? session?.user?.email ?? "your account";
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <p className="font-semibold">Signed in as {name}.</p>
        <p className="mt-1 leading-relaxed">
          Your books and comments will sync with Directus so you can review your
          activity history and receive notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
          aria-label="Close sign-in dialog"
        >
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      <h2 className="text-lg font-semibold text-slate-900">
        {contextCopy.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{contextCopy.description}</p>

      {availableProviders.length > 0 && (
        <div className="mt-4 grid gap-3">
          {availableProviders.map((provider) => {
            const meta = providerDetails[provider];
            if (!meta) {
              return null;
            }
            return (
              <Button
                key={provider}
                type="button"
                full
                className={`${meta.className} gap-2`}
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  void signIn(provider, { callbackUrl: window.location.href });
                }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                  {meta.icon}
                </span>
                <span className="flex-1 text-center">
                  Continue with {meta.label}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
          <button
            type="button"
            onClick={() => setView("signin")}
            className={`rounded-full px-3 py-1 ${
              view === "signin"
                ? "bg-white text-slate-900 shadow"
                : "hover:text-slate-700"
            }`}
          >
            Use email to sign in
          </button>
          <button
            type="button"
            onClick={() => setView("register")}
            className={`rounded-full px-3 py-1 ${
              view === "register"
                ? "bg-white text-slate-900 shadow"
                : "hover:text-slate-700"
            }`}
          >
            Create a Bookhunt account
          </button>
        </div>

        <form
          className="mt-4 grid gap-3"
          onSubmit={
            view === "signin" ? handleCredentialsSignIn : handleRegister
          }
        >
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {view === "register" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label>Last name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Display name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How others will see you"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : view === "signin"
              ? "Sign in with email"
              : "Register and continue"}
          </Button>
        </form>
      </div>

      {allowGuest && (
        <div className="mt-5">
          {!guestMode ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setError(null);
                setGuestMode(showGuestInput);
                if (!showGuestInput) {
                  onGuestComplete?.(guestName.trim() || "Guest");
                }
              }}
            >
              {contextCopy.skipCta}
            </Button>
          ) : showGuestInput ? (
            <form className="grid gap-3" onSubmit={handleGuestSubmit}>
              <div>
                <Label>{contextCopy.guestLabel}</Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Jamie from the park"
                />
              </div>
              <p className="text-xs text-slate-500">
                We’ll only use this name for this single{" "}
                {context === "book" ? "book entry" : "comment"}. You can create
                an account later to claim it.
              </p>
              <div className="flex gap-3">
                <Button type="submit">Continue as guest</Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setGuestMode(false)}
                >
                  Back
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
}
