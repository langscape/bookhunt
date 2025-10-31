import { getBook, getTransactionsForBook } from "@/lib/directus";
import { computeStats } from "@/lib/stats";
import BookActions from "@/components/BookActions";
import ActivityTimeline from "@/components/ActivityTimeline";
import { getServerLocale } from "@/lib/server/locale";
import { t } from "@/i18n/dictionaries";

type Props = { params: { id: string } };

export default async function BookPage({ params }: Props) {
  const book = await getBook(params.id);
  const txs = await getTransactionsForBook(params.id);
  const stats = computeStats(txs);
  const locale = getServerLocale();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
        <a href="/" className="text-sm text-violet-700 hover:text-violet-600">← {t(locale, "back")}</a>
        <header className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-emerald-700">{book.Title}</h1>
          {book.Author && <p className="text-sm text-slate-700">by {book.Author}</p>}
          {book.Description && <p className="mt-3 text-sm text-slate-600">{book.Description}</p>}
        </header>

        <BookActions bookId={params.id} />

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">{t(locale, "journey_stats")}</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label={t(locale, "traveled")} value={`${stats.miles.toFixed(0)} miles`} />
            <Stat label={t(locale, "cities_countries")} value={`${stats.cities} / ${stats.countries}`} />
            <Stat label={t(locale, "readers")} value={`${stats.readers}`} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">{t(locale, "latest_activity")}</h2>
          {txs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">{t(locale, "no_activity")}</p>
          ) : (
            <div className="mt-3">
              {/* Timeline for this specific book */}
              <ActivityTimeline initial={txs.slice().reverse()} locale={locale} bookId={params.id} hideBookLink />
            </div>
          )}
          {false && (<ul className="mt-3 space-y-3">
            {txs
              .slice()
              .reverse()
              .map((t) => (
                <li key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm">
                    <span className="font-medium text-emerald-700">{t.type === "FOUND" ? "Found" : "Released"}</span>
                    {t.city || t.country ? (
                      <span className="text-slate-700"> at {t.city ?? ""}{t.city && t.country ? ", " : ""}{t.country ?? ""}</span>
                    ) : null}
                    {t.reporter ? <span className="text-slate-700"> by {t.reporter}</span> : null}
                    <span className="text-slate-500"> · {new Date(t.date_created ?? Date.now()).toLocaleString()}</span>
                  </p>
                  {t.comment && <p className="mt-2 text-sm text-slate-700">“{t.comment}”</p>}
                </li>
              ))}
          </ul>)}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="text-xs uppercase tracking-wide text-slate-600">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
