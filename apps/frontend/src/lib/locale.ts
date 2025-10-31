const supported = ["en", "es", "pt"] as const;
export type Locale = (typeof supported)[number];

export function pickSupported(loc?: string | null): Locale {
  const primary = (loc ?? "en").split(",")[0]?.split("-")[0]?.toLowerCase();
  if (supported.includes(primary as Locale)) return primary as Locale;
  return "en";
}

// Client-safe module: only exports utilities that don't rely on next/headers
