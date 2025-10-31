import { createDirectus, rest, staticToken, createItem, readItem } from "@directus/sdk";

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

