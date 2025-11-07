"use client";

import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to Bookhunt</h1>
        <p className="mt-2 text-sm text-slate-600">Use your Bookhunt credentials to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div>
            <Label>Email</Label>
            <Input type="email" name="email" placeholder="you@example.com" required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" name="password" placeholder="••••••••" required />
          </div>

          {/* Error message placeholder */}
          <div className="hidden rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" aria-live="polite">
            Authentication error message
          </div>

          <Button type="submit" disabled full>
            Sign in
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Continue with</p>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" disabled>
              Google
            </Button>
            <Button type="button" variant="outline" disabled>
              Facebook
            </Button>
            <Button type="button" variant="outline" disabled>
              X (Twitter)
            </Button>
            <Button type="button" variant="outline" disabled>
              Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
