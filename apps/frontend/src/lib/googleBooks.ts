export interface GoogleBook {
  title: string;
  authors?: string[];
  description?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
}

export interface GoogleVolume {
  id: string;
  volumeInfo: GoogleBook;
}

export interface NormalizedBook {
  Title: string;
  Author?: string;
  Description?: string;
  ISBN?: string;
}

export async function lookupIsbn(isbn: string): Promise<NormalizedBook | null> {
  const q = encodeURIComponent(`isbn:${isbn}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const item: GoogleVolume | undefined = json.items?.[0];
    if (!item) return null;
    const info = item.volumeInfo;

    const normalized: NormalizedBook = {
      Title: info.title ?? "",
      Author: info.authors?.join(", ") ?? undefined,
      Description: info.description ?? undefined,
      ISBN:
        info.industryIdentifiers?.find((i) => i.type.includes("ISBN"))?.identifier ??
        isbn,
    };
    return normalized;
  } catch {
    return null;
  }
}

