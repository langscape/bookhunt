import Image from "next/image";

import { createDirectus, rest, readItems, staticToken } from "@directus/sdk";
import { getServerLocale } from "@/lib/server/locale";
import { t } from "@/i18n/dictionaries";

interface Book {
  id: string;
  Title: string;
  Author?: string;
  Description?: string;
  date_created: string;
}

interface Schema {
  Books: Book[];
}

// get directus instance from env
const directusUrl = process.env.DIRECTUS_URL;
const directusToken = process.env.DIRECTUS_TOKEN;

const directus = createDirectus<Schema>(directusUrl)
  .with(staticToken(directusToken))
  .with(rest());

const collection = "Books";

export default async function Home() {
  const locale = getServerLocale();
  const allBooks = await directus.request(readItems(collection));

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
            {t(locale, "hero_title")}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-slate-600">
            {t(locale, "hero_desc")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-6 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              href="https://docs.directus.io"
              target="_blank"
              rel="noreferrer"
            >
              {t(locale, "explore_directus")}
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
            >
              {t(locale, "learn_next")}
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{t(locale, "latest_books")}</h2>
              <p className="text-sm text-slate-600">
                This list is populated from the Directus collection{" "}
                <code>{collection}</code>.
              </p>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 sm:mt-0">
              {allBooks.length} {allBooks.length === 1 ? t(locale, "entries_label_singular") : t(locale, "entries_label_plural")}
            </span>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {allBooks.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">{t(locale, "no_entries")}</p>
            )}
            {allBooks.map((book) => (
              <article
                key={book.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-lg font-semibold text-emerald-700">
                  {book.Title}
                </h3>
                {book.Author && (
                  <p className="text-sm text-slate-700">by {book.Author}</p>
                )}
                {book.Description && (
                  <p className="text-sm text-slate-600">{book.Description}</p>
                )}
                <time className="text-xs text-slate-500">
                  Added on{" "}
                  {new Date(book.date_created ?? Date.now()).toLocaleString()}
                </time>
                <div className="pt-2">
                  <a
                    href={`/books/${book.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-violet-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-600"
                  >
                    View
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <a className="inline-flex items-center justify-center rounded-full bg-violet-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-600" href="/books/new">
              {t(locale, "create_book")}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
