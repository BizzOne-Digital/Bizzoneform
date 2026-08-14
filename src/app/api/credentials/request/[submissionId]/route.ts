import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createCredentialsRequest,
  revokeCredentialsRequest,
  getCredentialsInfo,
} from "@/lib/credentials-service";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { submissionId } = await params;
  const info = await getCredentialsInfo(submissionId);
  return NextResponse.json(info, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { submissionId } = await params;
    const result = await createCredentialsRequest(submissionId);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { submissionId } = await params;
  const info = await revokeCredentialsRequest(submissionId);
  return NextResponse.json({ info }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { submissionId } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.action === "regenerate") {
    try {
      const result = await createCredentialsRequest(submissionId);
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
