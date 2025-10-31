import { headers } from "next/headers";
import { pickSupported, type Locale } from "@/lib/locale";

export function getServerLocale(): Locale {
  const h = headers();
  const al = h.get("accept-language");
  return pickSupported(al);
}

export type { Locale };

