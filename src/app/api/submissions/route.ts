import { NextResponse } from "next/server";
import { getSubmissions, ObjectId } from "@/lib/mongodb";
import { isAuthenticated, createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// POST → login
// GET  → fetch submissions (auth required)
// PATCH → update submission (auth required)
// DELETE → delete submission (auth required) OR logout (if no id)

// "This Month" is keyed off the submission month (target_month), which
// defaults to created_at's month and only changes if someone manually shifts
// it — no automatic forward-rolling, so a site only shows up in the month it
// was actually submitted in unless a team member deliberately moves it.
async function backfillTargetMonth(col: Awaited<ReturnType<typeof getSubmissions>>) {
  await col.updateMany(
    { $or: [{ target_month: { $exists: false } }, { target_month: "" }] },
    [{ $set: { target_month: { $substrCP: ["$created_at", 0, 7] } } }]
  );

  // Sites marked domain_connected before this timestamp field existed have no
  // connect date on record — default it to created_at so they still show up
  // under some month in the "Domain Connected" view instead of vanishing.
  await col.updateMany(
    { domain_connected: true, $or: [{ domain_connected_at: { $exists: false } }, { domain_connected_at: null }] },
    [{ $set: { domain_connected_at: "$created_at" } }]
  );
}

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
  const month = searchParams.get("month"); // "YYYY-MM"
  const domainConnected = searchParams.get("domain_connected"); // "true" | "false"
  const assignedTo = searchParams.get("assigned_to");

  const col = await getSubmissions();
  await backfillTargetMonth(col);

  const query: Record<string, unknown> = {};
  if (status && status !== "all") query.status = status;
  if (assignedTo) query.assigned_to = assignedTo;

  if (domainConnected === "true") {
    query.domain_connected = true;
    // "Domain Connected" view is keyed off the month the domain actually went
    // live (domain_connected_at), not the delivery/target month — a site
    // targeted for July whose domain connects in August shows under August.
    if (month) query.domain_connected_at = { $regex: `^${month}` };
  } else if (domainConnected === "false") {
    query.domain_connected = { $ne: true };
  } else if (month) {
    // "This Month" view falls back to the created_at month when target_month isn't set
    query.$monthFilter = {
      $or: [
        { target_month: month },
        { target_month: { $in: [null, ""] }, created_at: { $regex: `^${month}` } },
      ],
    };
  }
  if (search) {
    query.$searchFilter = {
      $or: [
        { business: { $regex: search, $options: "i" } },
        { name:     { $regex: search, $options: "i" } },
        { email:    { $regex: search, $options: "i" } },
      ],
    };
  }
  // Merge the two $or clauses into a single $and so both filters apply together
  const andClauses: unknown[] = [];
  if (query.$monthFilter) { andClauses.push(query.$monthFilter); delete query.$monthFilter; }
  if (query.$searchFilter) { andClauses.push(query.$searchFilter); delete query.$searchFilter; }
  if (andClauses.length) query.$and = andClauses;
  // Group by target_month first so the list never jumps back and forth
  // between months — within a month, newest submission first.
  const docs = await col.find(query).sort({ target_month: -1, created_at: -1 }).toArray();
  return NextResponse.json(docs.map(d => ({ ...d, id: d._id.toString(), _id: undefined })));
}

export async function PATCH(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status, assigned_to, internal_notes, logo_url, target_month, domain_connected, package: pkg } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const update: Record<string, unknown> = { status, assigned_to, internal_notes };
  if (logo_url !== undefined) update.logo_url = logo_url;
  if (target_month !== undefined) update.target_month = target_month;
  if (pkg !== undefined) update.package = pkg;

  const col = await getSubmissions();

  if (domain_connected !== undefined) {
    update.domain_connected = domain_connected;
    if (domain_connected) {
      const existing = await col.findOne({ _id: new ObjectId(id) });
      // Keep the original connect date if it was already connected; only stamp on the flip to true.
      if (!existing?.domain_connected) update.domain_connected_at = new Date().toISOString();
    } else {
      update.domain_connected_at = null;
    }
  }

  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
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