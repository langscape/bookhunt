"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

import { AuthPrompt, type AuthPromptContext } from "@/components/auth/AuthPrompt";

export type AuthDialogResult =
  | { status: "authenticated" }
  | { status: "guest"; guestName: string }
  | { status: "cancelled" };

export type AuthDialogOptions = {
  context: AuthPromptContext;
  allowGuest?: boolean;
  showGuestInput?: boolean;
  initialGuestName?: string;
};

interface AuthDialogContextValue {
  openAuthDialog: (options: AuthDialogOptions) => Promise<AuthDialogResult>;
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [options, setOptions] = useState<AuthDialogOptions | null>(null);
  const resolverRef = useRef<((result: AuthDialogResult) => void) | null>(null);

  const closeDialog = useCallback((result: AuthDialogResult) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const openAuthDialog = useCallback((opts: AuthDialogOptions) => {
    return new Promise<AuthDialogResult>((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  useEffect(() => {
    if (!options) return;
    if (status === "authenticated") {
      closeDialog({ status: "authenticated" });
    }
  }, [status, options, closeDialog]);

  useEffect(() => {
    if (!options) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog({ status: "cancelled" });
      }
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [options, closeDialog]);

  const value = useMemo(() => ({ openAuthDialog }), [openAuthDialog]);

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      {options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-slate-900/60"
            aria-hidden
            onClick={() => closeDialog({ status: "cancelled" })}
          />
          <div className="relative z-10 w-full max-w-lg">
            <AuthPrompt
              context={options.context}
              allowGuest={options.allowGuest}
              showGuestInput={options.showGuestInput}
              initialGuestName={options.initialGuestName}
              onGuestComplete={(guestName) => closeDialog({ status: "guest", guestName })}
              onDismiss={() => closeDialog({ status: "cancelled" })}
            />
          </div>
        </div>
      )}
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) {
    throw new Error("useAuthDialog must be used within an AuthDialogProvider");
  }
  return ctx;
}
