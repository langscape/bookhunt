import {
  createDirectus,
  rest,
  staticToken,
  createItem,
  readItem,
  readItems,
} from "@directus/sdk";

// Directus typed schema for the fields we use in this project
export interface BookItem {
  id: string;
  Title: string;
  Author?: string | null;
  Description?: string | null;
  ISBN?: string | null;
  status?: string | null;
  date_created?: string;
  user_created?: string | null;
}

export interface Schema {
  Books: BookItem[];
  BookTransactions: BookTransaction[];
  Pages: Page[];
  PageBlocks: PageBlock[];
  NavigationLinks: NavigationLink[];
}

export type PageBlockType = "rich_text" | "media" | "video";

export interface PageBlock {
  id: string;
  block_type: PageBlockType;
  heading?: string | null;
  body?: string | null;
  media?:
    | string
    | {
        id: string;
        description?: string | null;
        filename_download?: string | null;
        type?: string | null;
        mime_type?: string | null;
        width?: number | null;
        height?: number | null;
      }
    | null;
  media_caption?: string | null;
  video_url?: string | null;
  sort?: number | null;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  status?: string | null;
  blocks?: PageBlock[] | null;
}

export type NavigationLocation = "header" | "footer" | "both";

export interface NavigationLink {
  id: string;
  label: string;
  location: NavigationLocation;
  external_url?: string | null;
  open_in_new_tab?: boolean | null;
  sort?: number | null;
  page?: string | { id: string; slug?: string | null } | null;
  status?: string | null;
}

export interface NavigationLinkView {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
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
  book: string | { id: string };
  type: TransactionType;
  reporter?: string | null;
  comment?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  date_created?: string;
  pictures?: string[] | { id: string }[] | null;
  user_created?: string | null;
}

export interface RichTransaction extends Omit<BookTransaction, "book"> {
  book?: string | { id: string; Title?: string | null; user_created?: string | null };
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

export async function getBooksCreatedByUser(userId: string, authToken?: string) {
  return getClient(authToken).request(
    readItems("Books", {
      filter: { user_created: { _eq: userId } },
      sort: ["-date_created"],
      limit: 12,
      fields: ["id", "Title", "Author", "date_created", "status"] as any,
    }),
  );
}

export async function getTransactionsCreatedByUser(userId: string, authToken?: string): Promise<RichTransaction[]> {
  return getClient(authToken).request(
    readItems("BookTransactions", {
      filter: { user_created: { _eq: userId } },
      sort: ["-date_created"],
      limit: 10,
      fields: [
        "id",
        "type",
        "date_created",
        "city",
        "country",
        "reporter",
        "comment",
        "book.id",
        "book.Title",
      ] as any,
    }),
  );
}

export async function getTransactionsForUserBooks(userId: string, authToken?: string): Promise<RichTransaction[]> {
  return getClient(authToken).request(
    readItems("BookTransactions", {
      filter: { book: { user_created: { _eq: userId } } },
      sort: ["-date_created"],
      limit: 10,
      fields: [
        "id",
        "type",
        "date_created",
        "city",
        "country",
        "reporter",
        "comment",
        "book.id",
        "book.Title",
      ] as any,
    }),
  );
}

export async function getPublishedPageSlugs(): Promise<string[]> {
  const pages = await getClient().request(
    readItems("Pages", {
      filter: { status: { _eq: "published" } },
      fields: ["slug"] as any,
      limit: -1,
      sort: ["sort", "title"],
    }),
  );
  return pages
    .map((page: any) => page?.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const pages = await getClient().request(
    readItems("Pages", {
      filter: {
        _and: [
          { slug: { _eq: slug } },
          { status: { _eq: "published" } },
        ],
      },
      limit: 1,
      fields: [
        "id",
        "title",
        "slug",
        "description",
        "blocks.id",
        "blocks.block_type",
        "blocks.heading",
        "blocks.body",
        "blocks.media.id",
        "blocks.media.description",
        "blocks.media.filename_download",
        "blocks.media.type",
        "blocks.media.mime_type",
        "blocks.media.width",
        "blocks.media.height",
        "blocks.media_caption",
        "blocks.video_url",
        "blocks.sort",
      ] as any,
      sort: ["sort"],
    }),
  );

  if (!pages.length) {
    return null;
  }

  const page = pages[0] as Page;
  if (page?.blocks?.length) {
    page.blocks = [...page.blocks].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }

  return page ?? null;
}

export interface NavigationBuckets {
  header: NavigationLinkView[];
  footer: NavigationLinkView[];
}

function resolveNavigationHref(link: NavigationLink): string | null {
  if (link.external_url) {
    return link.external_url;
  }
  const page = link.page as { slug?: string | null } | null;
  if (page?.slug) {
    return `/${page.slug}`;
  }
  return null;
}

export async function getNavigationLinks(): Promise<NavigationBuckets> {
  const rawLinks = await getClient().request(
    readItems("NavigationLinks", {
      filter: { status: { _eq: "published" } },
      sort: ["sort", "label"],
      fields: [
        "id",
        "label",
        "location",
        "external_url",
        "open_in_new_tab",
        "page.slug",
      ] as any,
      limit: -1,
    }),
  );

  const header: NavigationLinkView[] = [];
  const footer: NavigationLinkView[] = [];

  for (const link of rawLinks as NavigationLink[]) {
    const href = resolveNavigationHref(link);
    if (!href) continue;
    const mapped: NavigationLinkView = {
      id: link.id,
      label: link.label,
      href,
      openInNewTab: Boolean(link.open_in_new_tab),
    };
    if (link.location === "header" || link.location === "both") {
      header.push(mapped);
    }
    if (link.location === "footer" || link.location === "both") {
      footer.push(mapped);
    }
  }

  return {
    header,
    footer,
  };
}
