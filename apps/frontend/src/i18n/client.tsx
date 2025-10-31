"use client";

import React from "react";
import { pickSupported, type Locale } from "@/lib/locale";
import { t as translate } from "@/i18n/dictionaries";

type Ctx = { locale: Locale; t: (key: string) => string; setLocale: (l: Locale) => void };
const I18nContext = React.createContext<Ctx | undefined>(undefined);

export function I18nProvider({ children, defaultLocale }: { children: React.ReactNode; defaultLocale: Locale }) {
  const [locale, setLocale] = React.useState<Locale>(defaultLocale);

  React.useEffect(() => {
    const stored = localStorage.getItem("locale");
    const detected = pickSupported(stored ?? navigator?.language);
    setLocale(detected);
  }, []);

  const value = React.useMemo<Ctx>(() => ({
    locale,
    setLocale: (l) => {
      localStorage.setItem("locale", l);
      setLocale(l);
    },
    t: (key: string) => translate(locale, key),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

