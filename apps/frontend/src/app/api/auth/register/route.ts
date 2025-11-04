import { NextRequest, NextResponse } from "next/server";

import { registerDirectusUser } from "@/lib/auth/directus";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();
    const firstName = body?.firstName ? String(body.firstName).trim() : undefined;
    const lastName = body?.lastName ? String(body.lastName).trim() : undefined;
    const displayName = body?.displayName ? String(body.displayName).trim() : undefined;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await registerDirectusUser({
      email,
      password,
      firstName,
      lastName,
      displayName,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (error) {
    console.error("Failed to register", error);
    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
