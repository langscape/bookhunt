import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageBuilder } from "@/components/PageBuilder";
import { getPageBySlug, getPublishedPageSlugs } from "@/lib/directus";

interface PageRouteProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = await getPublishedPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageRouteProps): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page) {
    return {};
  }

  const title = page.title ? `${page.title} | Bookhunt` : "Bookhunt";
  const description = page.description ?? undefined;

  return {
    title,
    description,
  };
}

export default async function MarketingPage({ params }: PageRouteProps) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="bg-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{page.title}</h1>
          {page.description && (
            <p className="mt-3 text-lg text-slate-600">{page.description}</p>
          )}
        </header>
        <PageBuilder blocks={page.blocks ?? []} />
      </div>
    </main>
  );
}
