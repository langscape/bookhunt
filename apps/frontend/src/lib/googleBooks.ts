export interface GoogleBook {
  title: string;
  authors?: string[];
  description?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
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
  smallThumbnail?: string;
  thumbnail?: string;
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

    const smallThumbnail = normalizeThumbnailUrl(info.imageLinks?.smallThumbnail);
    const thumbnail = normalizeThumbnailUrl(info.imageLinks?.thumbnail) ?? smallThumbnail;

    const normalized: NormalizedBook = {
      Title: info.title ?? "",
      Author: info.authors?.join(", ") ?? undefined,
      Description: info.description ?? undefined,
      ISBN:
        info.industryIdentifiers?.find((i) => i.type.includes("ISBN"))?.identifier ??
        isbn,
      smallThumbnail: smallThumbnail ?? undefined,
      thumbnail: thumbnail ?? undefined,
    };
    return normalized;
  } catch {
    return null;
  }
}

function normalizeThumbnailUrl(url?: string) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^http:\/\//i, "https://");
}

