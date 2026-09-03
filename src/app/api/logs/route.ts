import { NextResponse } from "next/server";
import { getFormLogs } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

// POST → record a form attempt (public, called from the onboarding form itself)
// GET  → list logs for the dashboard (auth required)

export async function POST(req: Request) {
  try {
    const d = await req.json();
    const col = await getFormLogs();
    await col.insertOne({
      created_at: new Date().toISOString(),
      status:     d.status === "success" ? "success" : "failed",
      reason:     String(d.reason || "").slice(0, 500) || "—",
      name:       String(d.name || "").trim() || "—",
      business:   String(d.business || "").trim() || "—",
      email:      String(d.email || "").trim() || "—",
      phone:      String(d.phone || "").trim() || "—",
      step:       String(d.step || "").trim() || "—",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Log error:", err);
    // Never block the client's form flow if logging fails.
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const col = await getFormLogs();
  const docs = await col.find({}).sort({ created_at: -1 }).limit(500).toArray();
  return NextResponse.json(docs.map(d => ({ ...d, id: d._id.toString(), _id: undefined })));
}
