import { NextRequest } from "next/server";
import { createDirectus, rest, readItems, staticToken } from "@directus/sdk";

interface BookRef { id: string; Title?: string }
interface BookTransaction {
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
}

const directusUrl = process.env.DIRECTUS_URL as string;
const directusToken = process.env.DIRECTUS_TOKEN as string;

const directus = createDirectus(directusUrl).with(staticToken(directusToken)).with(rest());

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "10");
  const offset = Number(searchParams.get("offset") ?? "0");
  const bookId = searchParams.get("bookId");

  const query: any = {
    sort: ["-date_created"],
    limit,
    offset,
    fields: [
      "id",
      "type",
      "date_created",
      "reporter",
      "comment",
      "city",
      "country",
      "latitude",
      "longitude",
      "book.id",
      "book.Title",
      "pictures.id",
      "pictures.filename_download",
    ],
  };
  if (bookId) {
    query.filter = { book: { _eq: bookId } };
  }

  const items = (await directus.request(readItems("BookTransactions" as any, query))) as BookTransaction[];

  return new Response(JSON.stringify({ items }), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}
