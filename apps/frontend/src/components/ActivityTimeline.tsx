"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/locale";
import { t } from "@/i18n/dictionaries";

type BookRef = { id: string; Title?: string };
export type BookTransaction = {
  id: string;
  type?: "FOUND" | "RELEASED" | string;
  date_created?: string;
  reporter?: string;
  comment?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  book?: BookRef | string;
  pictures?: Array<{ id: string; filename_download?: string; title?: string }> | string[];
};

function MapThumb({ tx }: { tx: BookTransaction }) {
  const hasCoords =
    typeof tx.latitude === "number" && typeof tx.longitude === "number";
  const hasPlace = tx.city || tx.country;
  if (!hasCoords && !hasPlace) return null;

  const src = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(
        tx.longitude! - 0.02
      ).toFixed(6)},${(tx.latitude! - 0.02).toFixed(6)},${(
        tx.longitude! + 0.02
      ).toFixed(6)},${(tx.latitude! + 0.02).toFixed(
        6
      )}&layer=mapnik&marker=${tx.latitude!.toFixed(6)},${tx.longitude!.toFixed(
        6
      )}`
    : `https://www.google.com/maps?q=${encodeURIComponent(
        `${tx.city ?? ""} ${tx.country ?? ""}`
      )}&output=embed`;

  return (
    <div className="h-28 w-full overflow-hidden rounded-md border bg-slate-100 sm:h-32">
      {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
      <iframe className="h-full w-full" src={src} loading="lazy" />
    </div>
  );
}

export default function ActivityTimeline({
  initial,
  locale,
  bookId,
  hideBookLink,
}: {
  initial: BookTransaction[];
  locale: Locale;
  bookId?: string;
  hideBookLink?: boolean;
}) {
  const [items, setItems] = useState<BookTransaction[]>(initial);
  const [offset, setOffset] = useState<number>(initial.length);
  const [hasMore, setHasMore] = useState<boolean>(initial.length > 0);
  const [loading, setLoading] = useState<boolean>(false);
  const limit = 10;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
      if (bookId) params.set("bookId", bookId);
      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = (await res.json()) as { items: BookTransaction[] };
      setItems((prev) => [...prev, ...data.items]);
      setOffset((o) => o + data.items.length);
      if (data.items.length < limit) setHasMore(false);
    } catch (e) {
      // stop trying on errors for now
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [offset, limit, loading, hasMore, bookId]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const lineOffsets = useMemo(
    () => ["translate-x-0", "-translate-x-1", "translate-x-1"],
    []
  );

  return (
    <div className="relative">
      {/* Slightly wavy backbone line */}
      <div
        className="absolute left-5 top-0 bottom-0 w-px bg-slate-200"
        aria-hidden
      />

      <ul className="space-y-8">
        {items.map((tx, idx) => {
          const action = (tx.type || "").toUpperCase();
          const isFound = action === "FOUND";
          const isReleased = action === "RELEASED";
          const book =
            tx.book && typeof tx.book === "object" ? tx.book : undefined;
          const actor = tx.reporter;
          const location = [tx.city, tx.country].filter(Boolean).join(", ");
          const hasMap =
            (typeof tx.latitude === "number" &&
              typeof tx.longitude === "number") ||
            Boolean(tx.city || tx.country);
          const isEven = idx % 2 === 0;
          const pictures = Array.isArray(tx.pictures) ? tx.pictures : [];

          return (
            <li key={tx.id} className="relative pl-10">
              {/* Dot on line */}
              <span
                className="absolute left-4 top-3 block h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500"
                aria-hidden
              />

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div
                  className={`flex flex-col gap-3 sm:items-start sm:justify-between ${
                    hasMap ? (isEven ? "sm:flex-row" : "sm:flex-row-reverse") : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {actor ? `${actor} ` : ""}
                      {isFound
                        ? t(locale, "record_found")
                        : isReleased
                        ? t(locale, "record_release")
                        : tx.type || t(locale, "latest_activity")}
                      {book?.Title ? ` — ${book.Title}` : ""}
                    </h3>
                    {tx.comment && (
                      <p className="mt-1 text-sm text-slate-700">
                        {tx.comment}
                      </p>
                    )}
                    {pictures.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {pictures.map((p, i) => {
                          const id = typeof (p as any) === "string" ? (p as string) : (p as any).id;
                          if (!id) return null;
                          const base = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
                          const src = `${base}/assets/${id}`;
                          return (
                            <a key={id + i} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="Attachment" className="h-24 w-full object-cover" loading="lazy" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                    {location && (
                      <p className="mt-1 text-xs text-slate-500">{location}</p>
                    )}
                    <time className="mt-1 block text-xs text-slate-500">
                      {new Date(tx.date_created ?? Date.now()).toLocaleString()}
                    </time>
                    {!hideBookLink && (
                      <div className="mt-3">
                        <a
                          href={book?.id ? `/books/${book.id}` : "#"}
                          className="inline-flex items-center justify-center rounded-full bg-violet-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-600"
                        >
                          {t(locale, "open_book_page")}
                        </a>
                      </div>
                    )}
                  </div>
                  {hasMap && (
                    <div className="mt-3 w-full sm:mt-0 sm:w-56">
                      <MapThumb tx={tx} />
                    </div>
                  )}
                </div>
              </article>

              {/* Twirling connector to next item */}
              {idx < items.length - 1 && (
                <div className="relative h-10" aria-hidden>
                  <svg
                    className="absolute left-5 -ml-[6px] h-full w-3 text-slate-300"
                    viewBox="0 0 12 40"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M6 0 C12 6, 0 14, 6 20 S12 34, 6 40"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Sentinel for infinite scroll */}
      {hasMore && <div ref={sentinelRef} className="h-10" />}

      {loading && (
        <div className="mt-4 text-center text-sm text-slate-500">
          {t(locale, "loading") ?? "Loading..."}
        </div>
      )}
    </div>
  );
}
