"use client";

import { useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";

import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";

const providerLabels: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  twitter: "X",
  apple: "Apple",
};

type AuthPromptProps = {
  context: "book" | "comment";
  guestName: string;
  onGuestNameChange: (value: string) => void;
  skipActive: boolean;
  onSkipChange: (active: boolean) => void;
  showGuestInput?: boolean;
};

export function AuthPrompt({
  context,
  guestName,
  onGuestNameChange,
  skipActive,
  onSkipChange,
  showGuestInput = true,
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

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const contextCopy = useMemo(() => {
    if (context === "book") {
      return {
        title: "Create an account to track your book drops",
        description:
          "Sign in to keep a private log of the books you release, see their activity history, and receive updates.",
        skipCta: "Skip for now—I'll just leave my name",
        guestLabel: "Name to display with this book",
      };
    }
    return {
      title: "Sign in to leave richer comments",
      description:
        "With an account you can revisit your past sightings, manage notifications, and help the community spot issues.",
      skipCta: "Skip sign in—I'll comment with my name",
      guestLabel: "Name to show with your comment",
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

  if (isAuthenticated) {
    const name = session?.user?.name ?? session?.user?.email ?? "your account";
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <p className="font-semibold">Signed in as {name}.</p>
        <p className="mt-1 leading-relaxed">
          Your books and comments will sync with Directus so you can review your activity history and receive notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{contextCopy.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{contextCopy.description}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Object.entries(providerLabels).map(([provider, label]) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              void signIn(provider, { callbackUrl: window.location.href });
            }}
          >
            Continue with {label}
          </Button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
          <button
            type="button"
            onClick={() => setView("signin")}
            className={`rounded-full px-3 py-1 ${
              view === "signin" ? "bg-white text-slate-900 shadow" : "hover:text-slate-700"
            }`}
          >
            Use email to sign in
          </button>
          <button
            type="button"
            onClick={() => setView("register")}
            className={`rounded-full px-3 py-1 ${
              view === "register" ? "bg-white text-slate-900 shadow" : "hover:text-slate-700"
            }`}
          >
            Create a Bookhunt account
          </button>
        </div>

        <form className="mt-4 grid gap-3" onSubmit={view === "signin" ? handleCredentialsSignIn : handleRegister}>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Display name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How others will see you" />
              </div>
            </div>
          )}

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
          {successMessage && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {successMessage}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Please wait…" : view === "signin" ? "Sign in with email" : "Register and continue"}
          </Button>
        </form>
      </div>

      {!skipActive ? (
        <div className="mt-5">
          <Button type="button" variant="ghost" onClick={() => onSkipChange(true)}>
            {contextCopy.skipCta}
          </Button>
        </div>
      ) : showGuestInput ? (
        <div className="mt-5 grid gap-3">
          <div>
            <Label>{contextCopy.guestLabel}</Label>
            <Input
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
              placeholder="e.g. Jamie from the park"
            />
          </div>
          <p className="text-xs text-slate-500">
            We’ll only use this name for this single {context === "book" ? "book entry" : "comment"}. You can create an account
            later to claim it.
          </p>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Add your name in the form below so other readers know who left the {context === "book" ? "book" : "comment"}.
        </p>
      )}
    </div>
  );
}
