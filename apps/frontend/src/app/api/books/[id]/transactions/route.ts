import { NextRequest, NextResponse } from "next/server";
import { createTransaction } from "@/lib/directus";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const body = await req.json();
    const payload = {
      book: id,
      type: body?.type as "FOUND" | "RELEASED",
      reporter: body?.reporter as string | undefined,
      comment: body?.comment as string | undefined,
      city: body?.city as string | undefined,
      country: body?.country as string | undefined,
      latitude: typeof body?.latitude === "number" ? body.latitude : undefined,
      longitude: typeof body?.longitude === "number" ? body.longitude : undefined,
      status: "published",
    };

    if (!payload.type || (payload.type !== "FOUND" && payload.type !== "RELEASED")) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const created = await createTransaction(payload);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

