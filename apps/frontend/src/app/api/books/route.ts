import { NextRequest, NextResponse } from "next/server";
import { createBook } from "@/lib/directus";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Whitelist accepted fields
    const payload = {
      Title: body?.Title as string,
      Author: body?.Author as string | undefined,
      Description: body?.Description as string | undefined,
      ISBN: body?.ISBN as string | undefined,
      status: "published",
    };

    if (!payload.Title || payload.Title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const created = await createBook(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

