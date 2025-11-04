"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import Input, { Label, TextArea } from "@/components/ui/Input";
import { useI18n } from "@/i18n/client";
import { AuthPrompt } from "@/components/auth/AuthPrompt";

type Props = {
  bookId: string;
  onSubmitted?: () => void;
};

export default function BookActions({ bookId, onSubmitted }: Props) {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [type, setType] = React.useState<"FOUND" | "RELEASED" | null>(null);
  const [reporter, setReporter] = React.useState("");
  const [place, setPlace] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [coords, setCoords] = React.useState<{ lat?: number; lon?: number }>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [skipGuest, setSkipGuest] = React.useState(false);

  const isAuthenticated = status === "authenticated";
  const actorName = (session?.user?.name ?? reporter).trim();
  const canSubmit = Boolean(type) && (isAuthenticated || (skipGuest && actorName.length > 0));

  React.useEffect(() => {
    if (isAuthenticated && session?.user?.name) {
      setReporter(session.user.name);
      setSkipGuest(false);
    }
  }, [isAuthenticated, session?.user?.name]);

  async function getLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setError("Failed to get location"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function submit() {
    if (!type) return;
    if (!canSubmit) {
      setError("Please sign in or add your name before submitting");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const form = new FormData();
      form.append("type", type);
      const reporterName = isAuthenticated ? session?.user?.name ?? reporter : reporter;
      if (reporterName) form.append("reporter", reporterName);
      if (comment) form.append("comment", comment);
      if (city) form.append("city", city);
      if (country) form.append("country", country);
      if (typeof coords.lat === "number") form.append("latitude", String(coords.lat));
      if (typeof coords.lon === "number") form.append("longitude", String(coords.lon));
      if (place) form.append("place", place);
      files.forEach((f) => form.append("pictures", f));

      const res = await fetch(`/api/books/${bookId}/transactions`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(json?.error ?? "Failed to save");
        return;
      }
      setSuccess(type === "FOUND" ? "Found recorded!" : "Release recorded!");
      setType(null);
      setComment("");
      setFiles([]);
      onSubmitted?.();
    } catch (e) {
      setLoading(false);
      setError("Unexpected error");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <AuthPrompt
          context="comment"
          guestName={reporter}
          onGuestNameChange={setReporter}
          skipActive={skipGuest}
          onSkipChange={setSkipGuest}
          showGuestInput={false}
        />
      </div>

      <p className="text-sm text-slate-700">{t("set_free_explainer")}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button variant={type === "FOUND" ? "primary" : "outline"} onClick={() => setType("FOUND")}>{t("action_found")}</Button>
        <Button variant={type === "RELEASED" ? "primary" : "outline"} onClick={() => setType("RELEASED")}>{t("action_free")}</Button>
      </div>

      {type && (
        <div className="mt-5 grid grid-cols-1 gap-3">
          <div>
            <Label>{t("your_name")}</Label>
            <Input placeholder="e.g. Alex" value={reporter} onChange={(e) => setReporter(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>{t("city")}</Label>
              <Input placeholder={t("city")} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label>{t("country")}</Label>
              <Input placeholder={t("country")} value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>{t("comment_for_others")}</Label>
            <TextArea placeholder={t("comment_for_others")} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          <div>
            <Label>{t("upload_photos") ?? "Upload photos (optional)"}</Label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100"
            />
            {files.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">{files.length} file(s) selected</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={getLocation}>
              {coords.lat ? t("location_captured") : t("use_my_location")}
            </Button>
            {coords.lat && (
              <span className="text-xs text-slate-400">{coords.lat.toFixed(4)}, {coords.lon?.toFixed(4)}</span>
            )}
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</p>
          )}

            <Button onClick={submit} disabled={loading || !canSubmit} full>
              {loading ? "…" : type === "FOUND" ? t("record_found") : t("record_release")}
            </Button>
        </div>
      )}
    </div>
  );
}
