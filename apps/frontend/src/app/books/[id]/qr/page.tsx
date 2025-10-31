import Image from "next/image";
import Button from "@/components/ui/Button";
import { getBook } from "@/lib/directus";

type Props = { params: { id: string } };

export default async function BookQrPage({ params }: Props) {
  const book = await getBook(params.id);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const target = `${site}/books/${params.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    target
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-4 py-10">
        <h1 className="text-center text-2xl font-semibold">Book Added</h1>
        <div className="w-20">
          <Image src="/book.svg" alt="Book" width={80} height={80} />
        </div>

        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center">
          <p className="text-lg font-medium text-emerald-200">{book.Title}</p>
          {book.Author ? (
            <p className="mt-1 text-sm text-slate-300">by {book.Author}</p>
          ) : null}

          <div className="mt-6 flex items-center justify-center">
            {/* External simple QR image service to avoid extra dependencies */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR Code"
              className="rounded-xl border border-slate-800"
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button>Print</Button>
            <a
              href={target}
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              Open book page
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
