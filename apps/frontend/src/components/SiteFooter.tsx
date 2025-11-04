import Link from "next/link";

import { NavigationLinkView } from "@/lib/directus";

interface SiteFooterProps {
  navigation?: NavigationLinkView[];
}

export function SiteFooter({ navigation = [] }: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-3xl font-semibold text-white">
              Bookhunt
            </Link>
            <p className="mt-3 max-w-md text-sm text-slate-400">
              Discover, share, and trade books with a community of avid readers powered by Directus.
            </p>
          </div>
          {navigation.length > 0 && (
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              {navigation.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                  className="transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <p className="mt-10 text-xs text-slate-500">© {year} Bookhunt. All rights reserved.</p>
      </div>
    </footer>
  );
}
