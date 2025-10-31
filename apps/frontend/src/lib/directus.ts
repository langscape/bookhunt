import { createDirectus, rest, staticToken, createItem, readItem, readItems } from "@directus/sdk";

// Directus typed schema for the fields we use in this project
export interface BookItem {
  id: string;
  Title: string;
  Author?: string | null;
  Description?: string | null;
  ISBN?: string | null;
}

export interface Schema {
  Books: BookItem[];
  BookTransactions: BookTransaction[];
}

const url = process.env.DIRECTUS_URL as string;
const token = process.env.DIRECTUS_TOKEN as string;

// Server-side Directus client
export const directus = createDirectus<Schema>(url)
  .with(staticToken(token))
  .with(rest());

export async function createBook(data: Partial<BookItem>) {
  return directus.request(createItem("Books", data));
}

export async function getBook(id: string) {
  return directus.request(readItem("Books", id));
}

export type TransactionType = "FOUND" | "RELEASED";

export interface BookTransaction {
  id: string;
  book: string; // relation to Books.id
  type: TransactionType;
  reporter?: string | null;
  comment?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  date_created?: string;
}

export async function createTransaction(data: Partial<BookTransaction>) {
  return directus.request(createItem("BookTransactions", data));
}

export async function getTransactionsForBook(bookId: string) {
  return directus.request(
    readItems("BookTransactions", {
      filter: { book: { _eq: bookId } },
      sort: ["date_created"],
      limit: -1,
    }),
  );
}
