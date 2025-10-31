import Image from "next/image";

type DirectusBook = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  cover_url?: string;
  status?: string;
  date_created?: string;
  created_at?: string;
  updated_at?: string;
};

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";
const collection = "bookhunt_books";

async function fetchBooks(): Promise<DirectusBook[]> {
  try {
    const response = await fetch(`${directusUrl}/items/${collection}`, {
      next: { revalidate: 0 },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data?.data) ? (data.data as DirectusBook[]) : [];
  } catch (error) {
    console.error("Failed to fetch books from Directus", error);
    return [];
  }
}

export default async function Home() {
  const books = await fetchBooks();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <Image
              src="/book.svg"
              alt="Bookhunt logo"
              width={48}
              height={48}
              className="text-emerald-400"
            />
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Bookhunt keeps your catalog curated and close at hand.
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-slate-300">
            Manage your reading list, discover new titles, and synchronize content from the
            Directus backend wherever you are. This responsive starter shows how the Next.js
            frontend connects to Directus using the public REST API.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 px-6 py-3 text-sm font-medium text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
              href="https://docs.directus.io"
              target="_blank"
              rel="noreferrer"
            >
              Explore Directus Docs
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-emerald-400"
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
            >
              Learn about Next.js
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg backdrop-blur">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100 sm:text-2xl">Latest Books</h2>
              <p className="text-sm text-slate-400">
                This list is populated from the Directus collection <code>{collection}</code>.
              </p>
            </div>
            <span className="mt-2 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300 sm:mt-0">
              {books.length} entr{books.length === 1 ? "y" : "ies"}
            </span>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {books.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                No entries yet. Add books from Directus and refresh to see them appear here instantly.
              </p>
            )}
            {books.map((book) => (
              <article
                key={book.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
              >
                <h3 className="text-lg font-semibold text-emerald-200">{book.title}</h3>
                {book.author && <p className="text-sm text-slate-300">by {book.author}</p>}
                {book.description && (
                  <p className="text-sm text-slate-400">{book.description}</p>
                )}
                <time className="text-xs text-slate-500">
                  Added on {new Date(book.date_created ?? book.created_at ?? Date.now()).toLocaleString()}
                </time>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
