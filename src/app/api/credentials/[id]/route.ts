import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getCredentialsMetadata,
  getCredentialsBySubmissionId,
  revealField,
} from "@/lib/credentials-service";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }
  const { id } = await params;
  const submissionId = req.nextUrl.searchParams.get("submission_id");
  if (submissionId) {
    const meta = await getCredentialsBySubmissionId(submissionId);
    if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
    return NextResponse.json(meta, { headers: NO_STORE });
  }
  const meta = await getCredentialsMetadata(id);
  if (!meta) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  return NextResponse.json(meta, { headers: NO_STORE });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const fieldId = body.field_id as string;
  if (!fieldId) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: NO_STORE });

  try {
    const value = await revealField(id, fieldId);
    return NextResponse.json({ field_id: fieldId, value }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "Field not found" }, { status: 404, headers: NO_STORE });
  }
}
