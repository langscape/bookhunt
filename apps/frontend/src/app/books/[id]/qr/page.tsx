import Image from "next/image";
import Button from "@/components/ui/Button";
import { getBook } from "@/lib/directus";
import { getServerLocale } from "@/lib/server/locale";
import { t } from "@/i18n/dictionaries";

type Props = { params: { id: string } };

export default async function BookQrPage({ params }: Props) {
  const book = await getBook(params.id);
  const locale = getServerLocale();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const target = `${site}/books/${params.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    target
  )}`;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-10">
        <h1 className="text-center text-2xl font-semibold">
          {t(locale, "book_added")}
        </h1>
        <div className="w-20">
          <Image src="/book.svg" alt="Book" width={80} height={80} />
        </div>

        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-lg font-medium text-emerald-700">{book.Title}</p>
          {book.Author ? (
            <p className="mt-1 text-sm text-slate-700">by {book.Author}</p>
          ) : null}

          <div className="mt-6 flex items-center justify-center">
            {/* External simple QR image service to avoid extra dependencies */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR Code"
              className="rounded-xl border border-slate-200"
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button>{t(locale, "print")}</Button>
            <a
              href={target}
              className="text-sm text-violet-700 hover:text-violet-600"
            >
              {t(locale, "open_book_page")}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
