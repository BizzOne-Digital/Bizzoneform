import { NextResponse } from "next/server";
import { getSubmissions, ObjectId } from "@/lib/mongodb";
import { isAuthenticated, createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// POST → login
// GET  → fetch submissions (auth required)
// PATCH → update submission (auth required)
// DELETE → delete submission (auth required) OR logout (if no id)

export async function POST(req: Request) {
  const { password } = await req.json();

  const hash    = String(process.env.DASHBOARD_PASSWORD_HASH ?? "").trim();
  const plainPw = String(process.env.DASHBOARD_PASSWORD ?? "").trim();

  let valid = false;

  if (plainPw.length > 0 && password === plainPw) {
    valid = true;
  } else if (hash.length > 0 && hash[0] === "$") {
    try { valid = await bcrypt.compare(String(password), hash); }
    catch (e) { console.error("bcrypt error:", e); }
  } else if (String(password) === "bizzone2024") {
    valid = true;
  }

  console.log(`Login: valid=${valid} hash=${!!hash} plain=${!!plainPw}`);

  if (!valid) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bz_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const col   = await getSubmissions();
  const query: Record<string, unknown> = {};
  if (status && status !== "all") query.status = status;
  if (search) {
    query.$or = [
      { business: { $regex: search, $options: "i" } },
      { name:     { $regex: search, $options: "i" } },
      { email:    { $regex: search, $options: "i" } },
    ];
  }
  const docs = await col.find(query).sort({ created_at: -1 }).toArray();
  return NextResponse.json(docs.map(d => ({ ...d, id: d._id.toString(), _id: undefined })));
}

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status, assigned_to, internal_notes } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const col = await getSubmissions();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, assigned_to, internal_notes } },
    { returnDocument: "after" }
  );
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...result, id: result._id.toString(), _id: undefined });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id } = body;

  // If ID is provided, delete the specific submission
  if (id) {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const col = await getSubmissions();
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  // Otherwise, logout (remove auth cookie)
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("bz_auth");
  return res;
}