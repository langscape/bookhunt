import Image from "next/image";

import { createDirectus, rest, readItems, staticToken } from "@directus/sdk";

import { getServerLocale } from "@/lib/server/locale";
import { t } from "@/i18n/dictionaries";
import ActivityTimeline, {
  type BookTransaction,
} from "@/components/ActivityTimeline";
import { Galada } from "next/font/google";

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

const galada = Galada({ subsets: ["latin"], weight: "400", display: "swap" });

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
          <h1
            className={`text-balance text-4xl font-semibold tracking-tight sm:text-5xl ${galada.className}`}
          >
            {t(locale, "welcome_title")}
          </h1>

          {/* Banner image placeholder */}
          <div
            aria-label={t(locale, "banner_placeholder")}
            className="relative mx-auto flex h-40 w-full max-w-4xl items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-500 sm:h-52 lg:h-64"
          >
            <Image
              src="/banner.png"
              alt=""
              fill
              className="object-cover"
              priority
            />
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

      <div className="grid w-full gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t(locale, "dashboard_history_title")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t(locale, "dashboard_history_desc")}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {t(locale, "dashboard_history_badge")}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t(locale, "dashboard_notifications_title")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t(locale, "dashboard_notifications_desc")}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
            {t(locale, "dashboard_notifications_badge")}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t(locale, "dashboard_bug_title")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t(locale, "dashboard_bug_desc")}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
            {t(locale, "dashboard_bug_badge")}
          </span>
        </div>
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
