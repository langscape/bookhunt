import React from "react";

import { PageBlock } from "@/lib/directus";

const directusAssetBase = process.env.NEXT_PUBLIC_DIRECTUS_URL;

function resolveAssetUrl(media: PageBlock["media"]): string | null {
  if (!media) return null;
  if (typeof media === "string") {
    return directusAssetBase ? `${directusAssetBase}/assets/${media}` : null;
  }
  if (media.id) {
    return directusAssetBase ? `${directusAssetBase}/assets/${media.id}` : null;
  }
  return null;
}

function getEmbedUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    if (host.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      const pathId = url.pathname.split("/").filter(Boolean).pop();
      if (pathId) {
        return `https://www.youtube.com/embed/${pathId}`;
      }
    }
    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (host.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

function BlockWrapper({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      {children}
    </section>
  );
}

interface PageBuilderProps {
  blocks: PageBlock[];
}

export function PageBuilder({ blocks }: PageBuilderProps) {
  if (!blocks?.length) {
    return null;
  }

  return (
    <div className="mt-12 flex flex-col gap-10">
      {blocks.map((block) => {
        switch (block.block_type) {
          case "media": {
            const assetUrl = resolveAssetUrl(block.media);
            if (!assetUrl) {
              return null;
            }
            return (
              <BlockWrapper key={block.id}>
                {block.heading && (
                  <h2 className="text-2xl font-semibold text-slate-900">{block.heading}</h2>
                )}
                <div className="mt-6 overflow-hidden rounded-2xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetUrl}
                    alt={block.media_caption || block.heading || "Embedded media"}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {block.media_caption && (
                  <p className="mt-3 text-sm text-slate-500">{block.media_caption}</p>
                )}
                {block.body && (
                  <div
                    className="rich-text-content mt-4 text-slate-700"
                    dangerouslySetInnerHTML={{ __html: block.body }}
                  />
                )}
              </BlockWrapper>
            );
          }
          case "video": {
            const embedUrl = getEmbedUrl(block.video_url);
            if (!embedUrl) {
              return null;
            }
            return (
              <BlockWrapper key={block.id}>
                {block.heading && (
                  <h2 className="text-2xl font-semibold text-slate-900">{block.heading}</h2>
                )}
                <div className="mt-6 overflow-hidden rounded-2xl">
                  <div className="aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={block.heading || "Embedded video"}
                    />
                  </div>
                </div>
                {block.body && (
                  <div
                    className="rich-text-content mt-4 text-slate-700"
                    dangerouslySetInnerHTML={{ __html: block.body }}
                  />
                )}
              </BlockWrapper>
            );
          }
          case "rich_text":
          default: {
            if (!block.body && !block.heading) {
              return null;
            }
            return (
              <BlockWrapper key={block.id}>
                {block.heading && (
                  <h2 className="text-2xl font-semibold text-slate-900">{block.heading}</h2>
                )}
                {block.body && (
                  <div
                    className="rich-text-content mt-4 text-slate-700"
                    dangerouslySetInnerHTML={{ __html: block.body }}
                  />
                )}
              </BlockWrapper>
            );
          }
        }
      })}
    </div>
  );
}
