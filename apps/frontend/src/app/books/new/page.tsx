"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input, { Label, TextArea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CameraScanner from "@/components/CameraScanner";
import { lookupIsbn } from "@/lib/googleBooks";

export default function NewBookPage() {
  const router = useRouter();
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(targetIsbn?: string) {
    const value = (targetIsbn ?? isbn).trim();
    if (!value) return;
    setError(null);
    setLoading(true);
    const data = await lookupIsbn(value);
    setLoading(false);
    if (!data) {
      setError("Book not found from Google Books");
      return;
    }
    setTitle(data.Title);
    setAuthor(data.Author ?? "");
    setDescription(data.Description ?? "");
    setIsbn(data.ISBN ?? value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Title: title, Author: author, Description: description, ISBN: isbn }),
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:py-12">
        <button onClick={() => router.back()} className="text-sm text-violet-300 hover:text-violet-200">
          ← Back
        </button>
        <h1 className="text-3xl font-semibold">Add a New Book</h1>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-col items-stretch gap-4">
            <CameraScanner
              onDetected={(code) => {
                setIsbn(code);
                handleLookup(code);
              }}
            />

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>ISBN</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 9780143127741"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={() => handleLookup()}>Lookup</Button>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div>
                <Label>Author</Label>
                <Input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>

              <div>
                <Label>Description</Label>
                <TextArea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-2 text-sm text-red-300">{error}</p>
            )}

            <Button onClick={handleSubmit} disabled={loading} full>
              {loading ? "Saving…" : "Save Book"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

