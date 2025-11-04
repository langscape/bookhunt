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

function getClient(authToken?: string) {
  const base = createDirectus<Schema>(url).with(rest());
  const appliedToken = authToken || token;
  return appliedToken ? base.with(staticToken(appliedToken)) : base;
}

export async function createBook(data: Partial<BookItem>, authToken?: string) {
  return getClient(authToken).request(createItem("Books", data));
}

export async function getBook(id: string, authToken?: string) {
  return getClient(authToken).request(readItem("Books", id));
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
  pictures?: string[] | { id: string }[] | null;
}

export async function createTransaction(data: Partial<BookTransaction>, authToken?: string) {
  return getClient(authToken).request(createItem("BookTransactions", data));
}

export async function getTransactionsForBook(bookId: string) {
  return getClient().request(
    readItems("BookTransactions", {
      filter: { book: { _eq: bookId } },
      sort: ["date_created"],
      fields: [
        "id",
        "book",
        "type",
        "reporter",
        "comment",
        "city",
        "country",
        "latitude",
        "longitude",
        "date_created",
        "pictures.id"
      ] as any,
      limit: -1,
    }),
  );
}
