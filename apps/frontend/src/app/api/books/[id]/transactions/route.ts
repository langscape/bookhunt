import { NextRequest, NextResponse } from "next/server";

import { createTransaction } from "@/lib/directus";

const DIRECTUS_URL = process.env.DIRECTUS_URL as string;
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN as string;

async function uploadDirectusFile(file: File, tokenOverride?: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file, (file as any).name || "upload.jpg");
  const authToken = tokenOverride || DIRECTUS_TOKEN;
  const res = await fetch(`${DIRECTUS_URL}/files`, {
    method: "POST",
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    body: fd,
  });
  if (!res.ok) throw new Error("Upload failed");
  const json = (await res.json()) as any;
  return json?.data?.id as string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const contentType = req.headers.get("content-type") || "";
    let payload: any = { book: id, status: "published" };

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const type = form.get("type")?.toString() as
        | "FOUND"
        | "RELEASED"
        | undefined;
      payload.type = type;
      payload.reporter = form.get("reporter")?.toString() || undefined;
      payload.comment = form.get("comment")?.toString() || undefined;
      payload.city = form.get("city")?.toString() || undefined;
      payload.country = form.get("country")?.toString() || undefined;
      const lat = form.get("latitude");
      const lon = form.get("longitude");
      if (lat) payload.latitude = Number(lat);
      if (lon) payload.longitude = Number(lon);

      // Handle multiple files under "pictures"
      const pics = form.getAll("pictures");
      if (pics && pics.length > 0) {
        const ids: string[] = [];
        for (const p of pics) {
          if (p instanceof File) {
            const fid = await uploadDirectusFile(p);
            ids.push(fid);
          }
        }
        if (ids.length > 0) payload.pictures = ids;
      }
    } else {
      const body = await req.json();
      payload = {
        ...payload,
        type: body?.type as "FOUND" | "RELEASED",
        reporter: body?.reporter as string | undefined,
        comment: body?.comment as string | undefined,
        city: body?.city as string | undefined,
        country: body?.country as string | undefined,
        latitude:
          typeof body?.latitude === "number" ? body.latitude : undefined,
        longitude:
          typeof body?.longitude === "number" ? body.longitude : undefined,
      };
    }

    if (!payload.reporter || String(payload.reporter).trim().length === 0) {
      return NextResponse.json({ error: "Add your name before submitting" }, { status: 401 });
    }

    if (payload.reporter) {
      payload.reporter = String(payload.reporter).trim();
    }

    if (
      !payload.type ||
      (payload.type !== "FOUND" && payload.type !== "RELEASED")
    ) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const created = await createTransaction(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
