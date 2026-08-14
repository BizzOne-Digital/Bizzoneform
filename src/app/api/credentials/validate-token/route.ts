import { NextRequest, NextResponse } from "next/server";
import { validatePublicToken } from "@/lib/credentials-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const result = await validatePublicToken(token);
  if (!result.valid) {
    const messages: Record<string, string> = {
      invalid: "This credentials link is invalid.",
      expired: "This link has expired. Please contact BizzOne Digital for a new link.",
      revoked: "This link has been revoked.",
      completed: "Credentials have already been submitted.",
    };
    return NextResponse.json({
      valid: false,
      error: result.error,
      message: messages[result.error || "invalid"],
    });
  }
  return NextResponse.json({ valid: true, prefilled: result.prefilled });
}
