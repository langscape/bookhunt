import Image from "next/image";

import { createDirectus, rest, readItems, staticToken } from "@directus/sdk";
import { getServerLocale } from "@/lib/server/locale";
import { t } from "@/i18n/dictionaries";
import ActivityTimeline, {
  type BookTransaction,
} from "@/components/ActivityTimeline";

interface Book {
  id: string;
  Title: string;
  Author?: string;
  Description?: string;
  date_created: string;
  // Optional fields if Directus provides them
  city?: string;
  country?: string;
  location?: string;
  found_by?: string;
  foundBy?: string;
}

interface BookRef {
  id: string;
  Title?: string;
}

interface BookTransaction {
  id: string;
  type?: "FOUND" | "RELEASED" | string;
  date_created?: string;
  city?: string;
  country?: string;
  reporter?: string;
  comment?: string;
  latitude?: number;
  longitude?: number;
  book?: BookRef | string;
  pictures?: Array<{ id: string; title?: string }> | string[];
}

interface Schema {
  Books: Book[];
  BookTransactions: BookTransaction[];
}

// get directus instance from env
const directusUrl = process.env.DIRECTUS_URL;
const directusToken = process.env.DIRECTUS_TOKEN;

const directus = createDirectus<Schema>(directusUrl)
  .with(staticToken(directusToken))
  .with(rest());

const collection = "BookTransactions";

export default async function Home() {
  const locale = getServerLocale();
  const transactions = (await directus.request(
    readItems(
      collection as any,
      {
        sort: ["-date_created"],
        limit: 12,
        fields: [
          "id",
          "type",
          "date_created",
          "city",
          "country",
          "reporter",
          "comment",
          "latitude",
          "longitude",
          "book.id",
          "book.Title",
          "pictures.id",
        ],
      } as any
    )
  )) as BookTransaction[];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <Image
              src="/book.svg"
              alt="Bookhunt logo"
              width={48}
              height={48}
              className="text-emerald-600"
            />
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {t(locale, "welcome_title")}
          </h1>

          {/* Banner image placeholder */}
          <div
            aria-label={t(locale, "banner_placeholder")}
            className="mx-auto h-40 w-full max-w-4xl rounded-2xl bg-slate-100 text-slate-500 sm:h-52 lg:h-64 flex items-center justify-center"
          >
            <img src="/banner.png" alt="" className="h-full" />
          </div>

          <h2 className="text-xl font-medium text-slate-700">
            {t(locale, "hero_subtitle")}
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-slate-600">
            {t(locale, "welcome_intro")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-full bg-violet-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-600"
              href="/books/new"
            >
              {t(locale, "help_cta")}
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                {t(locale, "latest_activity")}
              </h2>
              <p className="text-sm text-slate-600">
                {t(locale, "activity_desc")}
              </p>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 sm:mt-0">
              {transactions.length}{" "}
              {transactions.length === 1
                ? t(locale, "entries_label_singular")
                : t(locale, "entries_label_plural")}
            </span>
          </header>

          <div className="mt-6">
            {transactions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
                {t(locale, "no_entries")}
              </p>
            ) : (
              <ActivityTimeline initial={transactions} locale={locale} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
