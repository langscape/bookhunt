"use client";

import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/lib/locale";
import { AuthDialogProvider } from "@/components/auth/AuthDialogProvider";

export function Providers({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  return (
    <I18nProvider defaultLocale={locale}>
      <AuthDialogProvider>{children}</AuthDialogProvider>
    </I18nProvider>
  );
}
