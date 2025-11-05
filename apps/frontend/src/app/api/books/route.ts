import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { createBook } from "@/lib/directus";
import { authOptions } from "@/lib/auth/options";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    // Whitelist accepted fields
    const payload = {
      Title: body?.Title as string,
      Author: body?.Author as string | undefined,
      Description: body?.Description as string | undefined,
      ISBN: body?.ISBN as string | undefined,
      thumbnail_small: body?.thumbnail_small as string | undefined,
      thumbnail: body?.thumbnail as string | undefined,
      status: "published",
    };

    const guestName = typeof body?.guestName === "string" ? body.guestName.trim() : "";

    if (!session && !guestName) {
      return NextResponse.json({ error: "Sign in or provide your name before creating a book" }, { status: 401 });
    }

    if (!session && guestName) {
      (payload as Record<string, unknown>).found_by = guestName;
    }

    if (!payload.Title || payload.Title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const directusToken = session?.user?.directusAccessToken;
    const created = await createBook(payload, directusToken);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

