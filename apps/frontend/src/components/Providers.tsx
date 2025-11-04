"use client";

import { SessionProvider } from "next-auth/react";

import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/lib/locale";

export function Providers({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <SessionProvider>
      <I18nProvider defaultLocale={locale}>{children}</I18nProvider>
    </SessionProvider>
  );
}
