import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import {
  getBooksCreatedByUser,
  getTransactionsCreatedByUser,
  getTransactionsForUserBooks,
  type BookItem,
  type RichTransaction,
} from "@/lib/directus";

function formatDate(value?: string) {
  if (!value) return "Unknown date";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function BookList({ books }: { books: BookItem[] }) {
  if (books.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
        You haven’t added any books yet. Start by registering a new release.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {books.map((book) => (
        <li key={book.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{book.Title}</h3>
              {book.Author && <p className="text-sm text-slate-600">{book.Author}</p>}
            </div>
            <p className="text-xs text-slate-500">Added {formatDate(book.date_created)}</p>
            <Link
              href={`/books/${book.id}`}
              className="inline-flex items-center justify-center rounded-full bg-violet-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-600"
            >
              View book
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityList({ items, emptyLabel }: { items: RichTransaction[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">{emptyLabel}</p>
    );
  }

  return (
    <ul className="grid gap-3">
      {items.map((item) => {
        const book = typeof item.book === "object" ? item.book : undefined;
        const location = [item.city, item.country].filter(Boolean).join(", ");
        const label = item.type === "FOUND" ? "Found" : item.type === "RELEASED" ? "Released" : item.type;
        return (
          <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {label} {book?.Title ? `— ${book.Title}` : ""}
                </p>
                {item.comment && <p className="text-sm text-slate-700">{item.comment}</p>}
              </div>
              {location && <p className="text-xs text-slate-500">{location}</p>}
              <p className="text-xs text-slate-400">{formatDate(item.date_created)}</p>
              {book?.id && (
                <Link
                  href={`/books/${book.id}`}
                  className="inline-flex w-fit items-center justify-center rounded-full border border-violet-200 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-50"
                >
                  Open book page
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;
  const directusToken = session.user.directusAccessToken;

  const [books, userActivity, bookActivity] = await Promise.all([
    getBooksCreatedByUser(userId, directusToken),
    getTransactionsCreatedByUser(userId, directusToken),
    getTransactionsForUserBooks(userId, directusToken),
  ]);

  const displayName = session.user.name ?? session.user.email ?? "Reader";

  return (
    <div className="bg-slate-50 pb-16 pt-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">{displayName}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track the books you have released and see how the community interacts with them.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 font-medium text-violet-700">
              {books.length} {books.length === 1 ? "book" : "books"}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
              {userActivity.length} recent actions
            </span>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[2fr,3fr]">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Your books</h2>
            <BookList books={books} />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Latest from you</h2>
            <ActivityList items={userActivity} emptyLabel="No recent activity yet." />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Community on your books</h2>
          <ActivityList
            items={bookActivity}
            emptyLabel="No one has interacted with your books yet. Share them with fellow readers!"
          />
        </section>
      </div>
    </div>
  );
}
