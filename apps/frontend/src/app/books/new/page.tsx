"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input, { Label, TextArea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CameraScanner from "@/components/CameraScanner";
import { useAuthDialog } from "@/components/auth/AuthDialogProvider";
import { lookupIsbn } from "@/lib/googleBooks";
import { useI18n } from "@/i18n/client";

export default function NewBookPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [smallThumbnail, setSmallThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const { openAuthDialog } = useAuthDialog();
  const actorName = guestName.trim();
  const isReadyToSubmit = actorName.length > 0;

  async function promptForAccess() {
    const result = await openAuthDialog({
      context: "book",
      allowGuest: true,
      showGuestInput: true,
      initialGuestName: guestName,
    });
    if (result.status === "guest") {
      setGuestName(result.guestName);
    }
  }

  async function handleLookup(targetIsbn?: string) {
    const value = (targetIsbn ?? isbn).trim();
    if (!value) return;
    setError(null);
    setLoading(true);
    const data = await lookupIsbn(value);
    setLoading(false);
    if (!data) {
      setError("Book not found from Google Books");
      setSmallThumbnail("");
      setThumbnail("");
      return;
    }
    setTitle(data.Title);
    setAuthor(data.Author ?? "");
    setDescription(data.Description ?? "");
    setIsbn(data.ISBN ?? value);
    setSmallThumbnail(data.smallThumbnail ?? "");
    setThumbnail(data.thumbnail ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isReadyToSubmit) {
      setError("Please provide a display name before saving");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Title: title,
          Author: author,
          Description: description,
          ISBN: isbn,
          thumbnail_small: smallThumbnail || undefined,
          thumbnail: thumbnail || undefined,
          guestName: actorName || undefined,
        }),
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(json?.error ?? "Failed to save");
        return;
      }
      const id = json?.id as string;
      router.push(`/books/${id}/qr`);
    } catch (err) {
      setLoading(false);
      setError("Unexpected error");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:py-12">
        <button
          onClick={() => router.back()}
          className="text-sm text-violet-700 hover:text-violet-600"
        >
          ← {t("back")}
        </button>
        <h1 className="text-3xl font-semibold">{t("add_new_book")}</h1>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {actorName ? (
            <div className="flex flex-col gap-3 text-sm text-slate-700">
              <span>
                Continuing as <strong>{actorName}</strong>. We’ll only use this
                name for the books you create during this session.
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => void promptForAccess()}
              >
                Update display name
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-sm text-slate-700">
              <span>
                Set a display name before creating a book so others know who
                released it.
              </span>
              <Button type="button" onClick={() => void promptForAccess()}>
                Choose display name
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col items-stretch gap-4">
            <CameraScanner
              onDetected={(code) => {
                setIsbn(code);
                handleLookup(code);
              }}
            />

            <div className="grid grid-cols-1 gap-3">
              {(smallThumbnail || thumbnail) && (
                <div className="flex justify-center">
                  <Image
                    src={smallThumbnail || thumbnail}
                    alt={title ? `Cover of ${title}` : "Book cover"}
                    width={150}
                    height={220}
                    className="rounded-lg border border-slate-200 object-cover"
                  />
                </div>
              )}

              <div>
                <Label>{t("isbn")}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 9780143127741"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLookup()}
                  >
                    {t("lookup")}
                  </Button>
                </div>
              </div>

              <div>
                <Label>{t("title")}</Label>
                <Input
                  placeholder={t("title")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label>{t("author")}</Label>
                <Input
                  placeholder={t("author")}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div>
                <Label>{t("description")}</Label>
                <TextArea
                  placeholder={t("description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading || !isReadyToSubmit}
              full
            >
              {loading ? t("saving") : t("save_book")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
