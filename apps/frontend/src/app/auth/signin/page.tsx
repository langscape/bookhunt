"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.ok) {
      window.location.href = "/";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to Bookhunt</h1>
        <p className="mt-2 text-sm text-slate-600">Use your Bookhunt credentials to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} full>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Continue with</p>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => signIn("google")}>Google</Button>
            <Button type="button" variant="outline" onClick={() => signIn("facebook")}>Facebook</Button>
            <Button type="button" variant="outline" onClick={() => signIn("twitter")}>X (Twitter)</Button>
            <Button type="button" variant="outline" onClick={() => signIn("apple")}>Apple</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
